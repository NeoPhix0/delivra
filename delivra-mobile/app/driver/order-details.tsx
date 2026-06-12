import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deliveryService } from "@services/api";

interface DeliveryDetail {
  id: string;
  status: string;
  pickup_address?: string;
  delivery_address?: string;
  pickup_phone?: string;
  delivery_phone?: string;
  distance_km?: number;
  estimated_price?: number;
  total_price?: number;
  estimated_time?: string;
  client?: {
    id: string;
    fullName: string;
    phone: string;
  };
  createdAt?: string;
  updatedAt?: string;
  ratings?: Array<{
    rating: number;
    comment?: string;
  }>;
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDelivery = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryService.getDeliveryById(id);
      const data = response.delivery || response;
      setDelivery(data);
    } catch (err: any) {
      console.error("Load order details error:", err);
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  const handleCall = (phone: string, name: string) => {
    Alert.alert("Call", `Calling ${name} at ${phone}`);
  };

  const formatStatus = (status: string) => {
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "—";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " • " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDelivery}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!delivery) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Order ID Card */}
        <View style={styles.orderIdCard}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdValue}>#{delivery.id}</Text>
          <Text style={styles.orderDate}>
            {formatDate(delivery.createdAt)}
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{formatStatus(delivery.status)}</Text>
          </View>
        </View>

        {/* Pickup Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Pickup Location</Text>
          <Text style={styles.cardLocation}>{delivery.pickup_address || "—"}</Text>
          {delivery.pickup_phone && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(delivery.pickup_phone!, "Pickup")}
            >
              <Feather name="phone" size={14} color={colors.white} />
              <Text style={styles.callButtonText}> Call Pickup</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏠 Delivery Location</Text>
          <Text style={styles.cardLocation}>{delivery.delivery_address || "—"}</Text>
          {delivery.delivery_phone && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(delivery.delivery_phone!, "Delivery")}
            >
              <Feather name="phone" size={14} color={colors.white} />
              <Text style={styles.callButtonText}> Call Delivery</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Card */}
        {delivery.client && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👤 Customer Information</Text>
            <Text style={styles.cardLocation}>{delivery.client.fullName}</Text>
            <Text style={styles.cardAddress}>{delivery.client.phone}</Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(delivery.client!.phone, delivery.client!.fullName)}
            >
              <Feather name="phone" size={14} color={colors.white} />
              <Text style={styles.callButtonText}> Call Customer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trip Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 Trip Details</Text>
          {delivery.distance_km != null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{delivery.distance_km} km</Text>
            </View>
          )}
          {delivery.estimated_time && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{delivery.estimated_time}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              {delivery.estimated_price || delivery.total_price || "—"} DA
            </Text>
          </View>
        </View>

        {/* Rating Card */}
        {delivery.ratings && delivery.ratings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Customer Feedback</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>
                ⭐ {delivery.ratings[0].rating}/5
              </Text>
            </View>
            {delivery.ratings[0].comment && (
              <Text style={styles.reviewText}>{delivery.ratings[0].comment}</Text>
            )}
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
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
  orderIdCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderIdLabel: {
    fontSize: 12,
    color: colors.grayLight,
    marginBottom: 4,
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.grayLight,
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.grayLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.success + "20",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.success,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 12,
  },
  cardLocation: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.black,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 12,
    color: colors.grayLight,
    marginBottom: 12,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.success,
  },
  callButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.grayLight,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.black,
  },
  ratingRow: {
    marginBottom: 8,
  },
  ratingStars: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: "bold",
  },
  reviewText: {
    fontSize: 13,
    color: colors.black,
    lineHeight: 18,
    fontStyle: "italic",
  },
});