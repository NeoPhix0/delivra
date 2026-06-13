import colors from "@constants/colors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import LeafletMap from "@components/shared/LeafletMap";
import * as Location from "expo-location";
import { driverService, deliveryService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";
import { socketService } from "../../src/services/socketService";
import { useAuth } from "@context/AuthContext";

const steps = ["Picked Up", "On The Way", "Delivered"];

const statusToStep: Record<string, number> = {
  'ACCEPTED': 0,
  'PICKED_UP': 1,
  'ON_THE_WAY': 2,
  'DELIVERED': 3,
  'CANCELLED': 4,
};

const stepToStatus: Record<number, string> = {
  0: 'PICKED_UP',
  1: 'ON_THE_WAY',
  2: 'DELIVERED',
};

const ACTIVE_STATUSES = ['ACCEPTED', 'PICKED_UP', 'ON_THE_WAY'];

export default function ActiveDeliveryScreen() {
  const params = useLocalSearchParams();
  const deliveryId = params.id as string;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [driverCoords, setDriverCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null);

  const openGoogleMaps = (lat: number, lng: number, label?: string) => {
    const url = Platform.select({
      ios: `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label ?? ''})`,
    });
    const fallback = `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Linking.openURL(fallback);
      }
    });
  };

  const loadDelivery = useCallback(async () => {
    if (!deliveryId) return;
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveryById(deliveryId);
      const data = response?.delivery || response;
      setDelivery(data);
      setCurrentStep(statusToStep[data.status] || 0);
    } catch (error: any) {
      console.error("Load delivery error:", error);
      Alert.alert("Error", "Failed to load delivery details");
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const startLocationEmission = useCallback(async () => {
    const token = user?.token;
    if (!token) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
    } catch (error) {
      console.error('Location permission error:', error);
      return;
    }

    if (!socketService.isConnected()) {
      socketService.connect(token);
    }
    socketService.joinDelivery(deliveryId);

    try {
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (location) => {
          setDriverCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
          socketService.emit('driver:location_update', {
            deliveryId,
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            heading: location.coords.heading ?? undefined,
          });
        }
      );
      locationWatcherRef.current = subscription;
    } catch (error) {
      console.error('Location watcher error:', error);
    }
  }, [user?.token, deliveryId]);

  const stopLocationEmission = useCallback(() => {
    if (locationWatcherRef.current) {
      locationWatcherRef.current.remove();
      locationWatcherRef.current = null;
    }
    socketService.leaveDelivery(deliveryId);
    socketService.disconnect();
  }, [deliveryId]);

  useEffect(() => {
    return () => {
      stopLocationEmission();
    };
  }, [stopLocationEmission]);

  const isDelivered = delivery?.status === 'DELIVERED';
  const isCancelled = delivery?.status === 'CANCELLED';
  const isTerminal = isDelivered || isCancelled;

  const handleCancelDelivery = async () => {
    if (!deliveryId) return;
    try {
      setCancelling(true);
      await Promise.all([
        driverService.rejectDelivery(deliveryId),
        driverService.updateOnlineStatus(true).catch(() => {}),
      ]);
      Alert.alert(
        "Cancelled",
        "Delivery has been cancelled and returned to available pool.",
        [{ text: "OK", onPress: () => router.replace('/driver') }],
      );
    } catch (err: any) {
      console.error("Cancel delivery error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to cancel delivery");
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!deliveryId || isTerminal) return;
    const nextStatus = stepToStatus[currentStep];
    if (!nextStatus) return;
    try {
      setUpdating(true);
      await driverService.updateDeliveryStatus(deliveryId, nextStatus);
      await loadDelivery();
      if (nextStatus === 'ON_THE_WAY') {
        startLocationEmission();
      }
      if (nextStatus === 'DELIVERED' || nextStatus === 'CANCELLED') {
        stopLocationEmission();
      }
      if (nextStatus === 'DELIVERED') {
        Alert.alert("Delivery Complete", "Order has been delivered successfully!");
      } else {
        Alert.alert("Status Updated", `Order status changed to: ${nextStatus.replace(/_/g, ' ')}`);
      }
    } catch (error: any) {
      console.error("Update status error:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to update delivery status");
    } finally {
      setUpdating(false);
    }
  };

  const getStepStatus = (index: number) => {
    if (delivery?.status === 'CANCELLED') return "cancelled";
    if (delivery?.status === 'DELIVERED') return "completed";
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  const getButtonText = () => {
    if (isDelivered) return "Delivered ✓";
    if (isCancelled) return "Cancelled";
    if (currentStep >= steps.length - 1) return "Complete Delivery";
    return `Mark as ${steps[currentStep]}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading delivery...</Text>
        </View>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No delivery found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const deliveryData = {
    orderId: delivery.trackingNumber || `DEL-${String(delivery.id).padStart(6, '0')}`,
    pickup: delivery.pickupAddress || delivery.pickup_address || '—',
    pickupAddress: delivery.pickupAddress || delivery.pickup_address || '—',
    pickupPhone: delivery.pickupPhone || delivery.pickup_phone || '—',
    delivery: delivery.deliveryAddress || delivery.delivery_address || '—',
    deliveryAddress: delivery.deliveryAddress || delivery.delivery_address || '—',
    deliveryPhone: delivery.deliveryPhone || delivery.delivery_phone || '—',
    customer: delivery.client?.fullName || delivery.client_name || '—',
    amount: `${delivery.totalPrice || delivery.total_price || 0} DA`,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader title="Active Delivery" showBackButton={true} onBackPress={() => router.back()} />

        <View style={styles.orderIdCard}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdValue}>{deliveryData.orderId}</Text>
        </View>

        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle,
                getStepStatus(index) === "completed" && styles.stepCompleted,
                getStepStatus(index) === "cancelled" && styles.stepCancelled,
                getStepStatus(index) === "current" && styles.stepCurrent,
              ]}>
                {getStepStatus(index) === "completed" ? (
                  <Feather name="check" size={14} color={colors.white} />
                ) : getStepStatus(index) === "cancelled" ? (
                  <Feather name="x" size={14} color={colors.white} />
                ) : (
                  <Text style={[styles.stepNumber, getStepStatus(index) === "current" && { color: colors.white }]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, getStepStatus(index) === "current" && { color: colors.primary, fontWeight: "bold" }]}>
                {step}
              </Text>
              {index < steps.length - 1 && (
                <View style={[styles.stepLine, getStepStatus(index) === "completed" && { backgroundColor: colors.success }]} />
              )}
            </View>
          ))}
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.mapContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={() => {
                const lat = driverCoords?.latitude ?? delivery?.pickupLat ?? 36.7538;
                const lng = driverCoords?.longitude ?? delivery?.pickupLng ?? 3.0588;
                openGoogleMaps(lat, lng, 'Delivery');
              }}
            >
              <LeafletMap
                region={{
                  latitude: driverCoords?.latitude ?? delivery?.pickupLat ?? 36.7538,
                  longitude: driverCoords?.longitude ?? delivery?.pickupLng ?? 3.0588,
                }}
                markers={[
                  driverCoords && { latitude: driverCoords.latitude, longitude: driverCoords.longitude, title: 'You', emoji: '🚗' },
                  delivery?.pickupLat && delivery?.pickupLng && { latitude: delivery.pickupLat, longitude: delivery.pickupLng, title: 'Pickup', emoji: '📦' },
                  delivery?.deliveryLat && delivery?.deliveryLng && { latitude: delivery.deliveryLat, longitude: delivery.deliveryLng, title: 'Delivery', emoji: '🏠' },
                ].filter(Boolean) as any}
                style={styles.map}
              />
            </TouchableOpacity>
            <Text style={styles.mapHint}>Tap map to open in Google Maps</Text>
          </View>
        )}

        <Animated.View style={[styles.locationCard, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.locationIconBg}>
            <MaterialCommunityIcons name="map-marker" size={22} color={colors.primary} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            <Text style={styles.locationName}>{deliveryData.pickup}</Text>
            <Text style={styles.locationAddress}>{deliveryData.pickupAddress}</Text>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.success }]}>
              <Feather name="phone" size={14} color={colors.white} />
              <Text style={styles.callBtnText}>Call Pickup</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.locationCard, { transform: [{ translateX: slideAnim }] }]}>
          <View style={[styles.locationIconBg, { backgroundColor: colors.warning + "20" }]}>
            <MaterialCommunityIcons name="home-map-marker" size={22} color={colors.secondary} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Delivery Location</Text>
            <Text style={styles.locationName}>{deliveryData.delivery}</Text>
            <Text style={styles.locationAddress}>{deliveryData.deliveryAddress}</Text>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.success }]}>
              <Feather name="phone" size={14} color={colors.white} />
              <Text style={styles.callBtnText}>Call Delivery</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.locationCard, { transform: [{ translateX: slideAnim }] }]}>
          <View style={[styles.locationIconBg, { backgroundColor: colors.primarySoft }]}>
            <Feather name="user" size={22} color={colors.primary} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Customer</Text>
            <Text style={styles.locationName}>{deliveryData.customer}</Text>
            <Text style={styles.locationAddress}>Amount: {deliveryData.amount}</Text>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.success }]}>
              <Feather name="phone" size={14} color={colors.white} />
              <Text style={styles.callBtnText}>Call Customer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[styles.updateBtn, isTerminal && { opacity: 0.5 }]}
          onPress={handleUpdateStatus}
          disabled={updating || isTerminal}
        >
          <LinearGradient colors={[colors.secondary, colors.secondaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.updateBtnGradient}>
            {updating ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.updateBtnText}>{getButtonText()}</Text>
                {!isTerminal && <Feather name="arrow-right" size={18} color={colors.white} />}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {ACTIVE_STATUSES.includes(delivery?.status) && (
          <TouchableOpacity
            style={[styles.rejectButton, { marginHorizontal: 16, marginBottom: 16 }]}
            onPress={handleCancelDelivery}
            disabled={cancelling || updating}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Text style={[styles.rejectButtonText, { color: colors.error }]}>Cancel Delivery</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B' },
  errorText: { fontSize: 16, color: '#EF4444', marginBottom: 16 },
  orderIdCard: { marginHorizontal: 16, marginTop: 16, marginBottom: 16, padding: 16, borderRadius: 20, backgroundColor: colors.white, alignItems: "center", shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  orderIdLabel: { fontSize: 12, color: colors.grayLight, marginBottom: 4 },
  orderIdValue: { fontSize: 18, fontWeight: "bold", color: colors.secondary },
  progressContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginVertical: 16 },
  stepWrapper: { flex: 1, alignItems: "center" },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  stepCompleted: { backgroundColor: colors.success },
  stepCancelled: { backgroundColor: colors.error },
  stepCurrent: { backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primaryLight },
  stepNumber: { fontSize: 14, fontWeight: "bold", color: colors.grayLight },
  stepLabel: { fontSize: 11, color: colors.grayLight, textAlign: "center" },
  stepLine: { position: "absolute", top: 18, left: "50%", width: "100%", height: 2, backgroundColor: colors.border },
  locationCard: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 20, backgroundColor: colors.white, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  locationIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 14 },
  locationContent: { flex: 1 },
  locationLabel: { fontSize: 11, color: colors.grayLight, marginBottom: 2 },
  locationName: { fontSize: 15, fontWeight: "600", color: colors.black, marginBottom: 2 },
  locationAddress: { fontSize: 12, color: colors.grayLight, marginBottom: 12 },
  callBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  callBtnText: { color: colors.white, fontSize: 12, fontWeight: "500" },
  updateBtn: { marginHorizontal: 16, marginVertical: 16, borderRadius: 40, overflow: "hidden" },
  updateBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8 },
  updateBtnText: { color: colors.white, fontSize: 16, fontWeight: "bold" },
  backButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8 },
  backButtonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  rejectButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14, borderRadius: 30, borderWidth: 1.5, borderColor: colors.error },
  rejectButtonText: { fontSize: 14, fontWeight: "600" },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
  },
  map: {
    flex: 1,
    height: 220,
  },
  driverMarker: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  driverMarkerText: {
    fontSize: 18,
  },
  destinationMarker: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  destinationMarkerText: {
    fontSize: 18,
  },
  mapHint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.grayLight,
    paddingVertical: 4,
  },
});