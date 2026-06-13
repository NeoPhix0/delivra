import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import LeafletMap from "@components/shared/LeafletMap";
import { deliveryService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";
import useDeliveryTracking from "../../src/hooks/useDeliveryTracking";


const steps = ["Pending", "Accepted", "On the way", "Delivered"];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const { driverLocation, isConnected } = useDeliveryTracking(id as string | null);
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    loadDelivery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDelivery = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveryById(id as string);
      const data = response.delivery || response;
      setDelivery(data);
      
      // Determine current step based on status
      const statusToStep: Record<string, number> = {
        PENDING: 0,
        ACCEPTED: 1,
        PICKED_UP: 2,
        ON_THE_WAY: 3,
        DELIVERED: 4,
      };
      setCurrentStep(statusToStep[data.status] || 0);
    } catch (error) {
      console.error('Error loading delivery:', error);
      Alert.alert('Error', 'Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim2, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim2, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, headerSlide, slideAnim, orbAnim1, orbAnim2]);

  const handleCallDriver = () => {
    if (delivery?.driver?.phone) {
      Alert.alert("Call Driver", `Calling ${delivery.driver.fullName}...`);
    }
  };
  const handleCancelOrder = async () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await deliveryService.cancelDelivery(delivery.id);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primaryDark}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Track Order"
          subtitle="Live delivery tracking"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightContent={
            <TouchableOpacity style={styles.refreshButton}>
              <View style={styles.refreshButtonInner}>
                <Feather name="refresh-cw" size={18} color={colors.white} />
              </View>
            </TouchableOpacity>
          }
        />

        {/* Order ID Card */}
        <Animated.View
          style={[
            styles.orderIdCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[colors.primarySoft, colors.white]}
            style={styles.orderIdGradient}
          >
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>{delivery?.id || 'N/A'}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Progress Steps */}
        <Animated.View
          style={[
            styles.progressContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${(currentStep / (steps.length - 1)) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={step} style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    index <= currentStep && styles.stepCircleActive,
                    index === currentStep && styles.stepCircleCurrent,
                  ]}
                >
                  {index < currentStep ? (
                    <Feather name="check" size={12} color={colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        index <= currentStep && styles.stepNumberActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    index <= currentStep && styles.stepLabelActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Map View */}
        {Platform.OS !== 'web' && (
          <Animated.View
            style={[
              styles.mapContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                const lat = driverLocation?.lat ?? delivery?.pickupLat ?? 36.7538;
                const lng = driverLocation?.lng ?? delivery?.pickupLng ?? 3.0588;
                openGoogleMaps(lat, lng);
              }}
            >
              <View style={{ height: 250, width: '100%' }}>
                <LeafletMap
                  region={{
                    latitude: driverLocation?.lat ?? delivery?.pickupLat ?? 36.7538,
                    longitude: driverLocation?.lng ?? delivery?.pickupLng ?? 3.0588,
                  }}
                  markers={[
                    driverLocation && { latitude: driverLocation.lat, longitude: driverLocation.lng, title: 'Driver', emoji: '🚚' },
                    delivery?.pickupLat && delivery?.pickupLng && { latitude: delivery.pickupLat, longitude: delivery.pickupLng, title: 'Pickup', emoji: '📦' },
                    delivery?.deliveryLat && delivery?.deliveryLng && { latitude: delivery.deliveryLat, longitude: delivery.deliveryLng, title: 'Delivery', emoji: '🏠' },
                  ].filter(Boolean) as any}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.mapHint}>Tap map to open in Google Maps</Text>
            <TouchableOpacity style={styles.mapControl}>
              <Feather name="target" size={20} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Driver Info Card */}
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[colors.primarySoft, colors.white]}
            style={styles.cardGradient}
          >
            <Text style={styles.cardTitle}>Driver Information</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>👨‍✈️</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{delivery?.driver?.fullName || 'Not assigned'}</Text>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={14} color={colors.warning} />
                  <Text style={styles.ratingText}>{delivery?.driver?.rating || 'N/A'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDriver}
              >
                <LinearGradient
                  colors={[colors.success, colors.success + "CC"]}
                  style={styles.callButtonGradient}
                >
                  <Feather name="phone" size={16} color={colors.white} />
                  <Text style={styles.callButtonText}>Call</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ETA Card */}
        <Animated.View
          style={[
            styles.etaCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.etaRow}>
            <View
              style={[styles.etaIcon, { backgroundColor: colors.primarySoft }]}
            >
              <Feather name="clock" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.etaLabel}>Estimated arrival</Text>
              <Text style={styles.etaValue}>{delivery?.eta || 'Calculating...'}</Text>
            </View>
          </View>
          <View style={styles.etaRow}>
            <View
              style={[
                styles.etaIcon,
                { backgroundColor: colors.secondarySoft },
              ]}
            >
              <Feather name="map-pin" size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={styles.etaLabel}>Distance</Text>
              <Text style={styles.etaValue}>{delivery?.distance || 'Calculating...'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Cancel Button */}
        {currentStep < 2 && (
          <Animated.View
            style={[
              styles.cancelButtonWrapper,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity onPress={handleCancelOrder} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.error, colors.error + "CC"]}
                style={styles.cancelButton}
              >
                <Feather name="x-circle" size={18} color={colors.white} />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButton: {
    padding: 4,
  },
  refreshButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white + "33",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.white + "4D",
  },

  orderIdCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  orderIdGradient: {
    padding: 16,
    alignItems: "center",
  },
  orderIdLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
  },

  // Progress Steps
  progressContainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.graySoft,
    borderRadius: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.graySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.secondary,
  },
  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: colors.secondaryLight,
    backgroundColor: colors.secondary,
  },
  stepNumber: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: "bold",
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLabel: {
    fontSize: 9,
    color: colors.gray,
    textAlign: "center",
  },
  stepLabelActive: {
    color: colors.secondary,
    fontWeight: "500",
  },

  // Map
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapControl: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: colors.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapHint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.grayLight,
    paddingVertical: 4,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  driverMarkerText: {
    fontSize: 20,
  },
  destinationMarker: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  destinationMarkerText: {
    fontSize: 20,
  },

  // Cards
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 16,
  },

  // Driver Row
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 28,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "600",
    marginLeft: 4,
  },
  callButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  callButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  callButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },

  // ETA Card
  etaCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  etaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  etaLabel: {
    fontSize: 11,
    color: colors.gray,
  },
  etaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
  },

  // Cancel Button
  cancelButtonWrapper: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 40,
    gap: 8,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
});
