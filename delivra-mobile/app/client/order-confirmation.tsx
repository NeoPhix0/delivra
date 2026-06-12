import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deliveryService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";

interface DeliveryData {
  id: string;
  status: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  distanceKm?: number;
  totalPrice?: number;
  category?: {
    id: string;
    name: string;
    displayName: string;
  };
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    driverProfile?: {
      vehicleType?: string;
      rating?: number;
      pricePerKm?: number;
    };
  };
  createdAt?: string;
}

export default function OrderConfirmationScreen() {
  const params = useLocalSearchParams();
  const deliveryId = (params.id as string) || (params.deliveryId as string) || "";
  const [delivery, setDelivery] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickupAddress = (params.pickupAddress as string) || "";
  const deliveryAddress = (params.deliveryAddress as string) || "";
  const pickupPhone = (params.pickupPhone as string) || "";
  const deliveryPhone = (params.deliveryPhone as string) || "";
  const description = (params.description as string) || "";
  const weight = (params.weight as string) || "";
  const categoryId = (params.categoryId as string) || null;
  const categoryIcon = (params.categoryIcon as string) || "";
  const pickupLat = (params.pickupLat as string) || "";
  const pickupLng = (params.pickupLng as string) || "";
  const deliveryLat = (params.deliveryLat as string) || "";
  const deliveryLng = (params.deliveryLng as string) || "";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  const loadDelivery = useCallback(async () => {
    if (!deliveryId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryService.getDeliveryById(deliveryId);
      const data = response.delivery || response;
      setDelivery(data);
    } catch (err: any) {
      console.error("Load delivery error:", err);
      setError(err.message || "Failed to load delivery details");
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

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

  const handleConfirmOrder = async () => {
    if (deliveryId) {
      router.push({
        pathname: "/client/order-tracking",
        params: { id: deliveryId },
      });
      return;
    }

    if (!pickupAddress || !deliveryAddress) {
      Alert.alert(
        "Error",
        "Missing delivery information. Please start over."
      );
      return;
    }

    try {
      setSubmitting(true);
      const deliveryData = {
        pickupAddress,
        deliveryAddress,
        pickupPhone,
        deliveryPhone,
        notes: description,
        weight: parseFloat(weight) || 0,
        ...(categoryId ? { categoryId: parseInt(categoryId, 10) } : {}),
        ...(pickupLat ? { pickupLat: parseFloat(pickupLat) } : {}),
        ...(pickupLng ? { pickupLng: parseFloat(pickupLng) } : {}),
        ...(deliveryLat ? { deliveryLat: parseFloat(deliveryLat) } : {}),
        ...(deliveryLng ? { deliveryLng: parseFloat(deliveryLng) } : {}),
      };
      const response = await deliveryService.createDelivery(deliveryData);
      const newId = response?.delivery?.id || response?.id;
      if (!newId) throw new Error("No delivery ID returned");
      router.replace({
        pathname: "/client/order-confirmation",
        params: {
          id: newId,
          categoryId: categoryId,
          categoryIcon: categoryIcon,
          pickupAddress: pickupAddress,
          deliveryAddress: deliveryAddress,
          pickupLat: pickupLat,
          pickupLng: pickupLng,
          deliveryLat: deliveryLat,
          deliveryLng: deliveryLng,
        },
      });
    } catch (err: any) {
      console.error("Confirm order error:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create delivery. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <SharedHeader title="Order Summary" subtitle="Loading..." showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <SharedHeader title="Order Summary" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDelivery}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const driverName = delivery?.driver?.fullName || (params.driverName as string) || "—";
  const driverRating = (delivery?.driver?.driverProfile?.rating ?? parseFloat(params.driverRating as string)) || 0;
  const driverPrice = (delivery?.driver?.driverProfile?.pricePerKm ?? parseFloat(params.driverPrice as string)) || 0;
  const driverImage = (params.driverImage as string) || "";
  const distance = (delivery?.distanceKm ?? parseFloat(params.distance as string)) || 0;
  const categoryName = delivery?.category?.displayName || delivery?.category?.name || categoryIcon || "—";
  const estimatedPrice = delivery?.totalPrice ?? 0;
  const buttonLabel = deliveryId ? "Track Order" : "Confirm Order";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Order Summary"
          subtitle="Review your delivery details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        <Animated.View
          style={[
            styles.successCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[colors.success, colors.success + "CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <View style={styles.successCircle}>
              <Feather name="check" size={40} color={colors.white} />
            </View>
            <Text style={styles.successText}>Order Ready!</Text>
            <Text style={styles.successSubtext}>
              {delivery?.status
                ? `Status: ${delivery.status}`
                : "Your delivery has been confirmed"}
            </Text>
          </LinearGradient>
        </Animated.View>

        {delivery?.driver ? (
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
              <Text style={styles.cardTitle}>Selected Driver</Text>
              <View style={styles.driverRow}>
                <View style={styles.avatarRing}>
                  {driverImage ? (
                    <Image
                      source={{ uri: driverImage }}
                      style={styles.driverAvatarImage}
                    />
                  ) : (
                    <View style={[styles.driverAvatarImage, styles.avatarPlaceholder]}>
                      <Feather name="user" size={24} color={colors.grayLight} />
                    </View>
                  )}
                  <View style={[styles.onlineDot, styles.onlineDotGreen]} />
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driverName}</Text>
                  {driverRating > 0 && (
                    <View style={styles.ratingRow}>
                      <Feather name="star" size={13} color={colors.warning} />
                      <Text style={styles.ratingText}>
                        {driverRating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
                {driverPrice > 0 && (
                  <Text style={styles.driverPrice}>
                    {driverPrice.toFixed(2)} DA/km
                  </Text>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardTitle}>Order Details</Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Category</Text>
            <Text style={styles.detailsValue}>{categoryName}</Text>
          </View>
          {(delivery?.distanceKm || delivery?.totalPrice) ? (
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Distance</Text>
              <Text style={styles.detailsValue}>{distance} km</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.locationRow}>
            <View
              style={[
                styles.locationIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Feather name="map-pin" size={14} color={colors.primary} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationValue}>
                {delivery?.pickupAddress || pickupAddress || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.arrowIcon}>
            <Feather name="arrow-down" size={16} color={colors.grayLight} />
          </View>

          <View style={styles.locationRow}>
            <View
              style={[
                styles.locationIcon,
                { backgroundColor: colors.secondarySoft },
              ]}
            >
              <Feather name="home" size={14} color={colors.secondary} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Delivery</Text>
              <Text style={styles.locationValue}>
                {delivery?.deliveryAddress || deliveryAddress || "—"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {delivery?.status === 'PENDING' && (
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.cardTitle}>Order Status</Text>
            <Text style={styles.detailsValue}>Your order has been placed. Waiting for a driver to accept it.</Text>
          </Animated.View>
        )}

        {(delivery?.distanceKm || delivery?.totalPrice) ? (
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.cardTitle}>Price Summary</Text>

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {estimatedPrice} DA
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.buttonWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleConfirmOrder}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButton}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Feather
                    name={deliveryId ? "navigation" : "check-circle"}
                    size={18}
                    color={colors.white}
                  />
                  <Text style={styles.confirmButtonText}>{buttonLabel}</Text>
                  <Feather name="arrow-right" size={18} color={colors.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.goHomeButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Feather name="home" size={18} color={colors.primary} />
          <Text style={styles.goHomeButtonText}>Go Home</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grayLight,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  successCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  successGradient: {
    padding: 20,
    alignItems: "center",
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white + "40",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 12,
    color: colors.white + "CC",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 16,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  driverAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.graySoft,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  onlineDotGreen: {
    backgroundColor: colors.success,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "600",
  },
  driverPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.secondary,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 13,
    color: colors.gray,
  },
  detailsValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: colors.graySoft,
    marginVertical: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.black,
  },
  arrowIcon: {
    alignItems: "center",
    marginVertical: 6,
    marginLeft: 18,
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.graySoft,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.secondary,
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 30,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 40,
    gap: 10,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  goHomeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    gap: 8,
  },
  goHomeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
