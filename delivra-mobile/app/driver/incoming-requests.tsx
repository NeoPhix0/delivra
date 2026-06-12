import colors from "@constants/colors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { driverService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";

interface IncomingRequest {
  id: string;
  pickup_address?: string;
  delivery_address?: string;
  distance_km?: number;
  estimated_price?: string | number;
  total_price?: string | number;
  client?: {
    id: string;
    fullName: string;
    phone: string;
  };
  category?: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
    color: string;
  };
  createdAt?: string;
}

export default function IncomingRequestsScreen() {
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const checkAndRedirectIfActive = async (): Promise<boolean> => {
    try {
      const response = await driverService.getDeliveries();
      const data = response?.data || response || {};
      const list = data?.deliveries || [];
      const active = list.find((d: any) =>
        ['ACCEPTED', 'PICKED_UP', 'ON_THE_WAY'].includes(d.status)
      );
      if (active) {
        router.replace({
          pathname: '/driver/active-delivery',
          params: { id: String(active.id) },
        });
        return true;
      }
      return false;
    } catch (_e) {
      return false;
    }
  };

  const loadAvailableRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hasActive = await checkAndRedirectIfActive();
      if (hasActive) return;
      const response = await driverService.getAvailableDeliveries();
      const data = response?.data || response || [];
      const raw = Array.isArray(data) ? data : [];
      setRequests(raw.map((d: any) => ({
        id: d.id,
        pickup_address: d.pickupAddress || d.pickup_address || '',
        delivery_address: d.deliveryAddress || d.delivery_address || '',
        distance_km: d.distanceKm ?? d.distance_km ?? 0,
        estimated_price: d.totalPrice ?? d.estimated_price ?? d.total_price ?? 0,
        total_price: d.totalPrice ?? d.total_price ?? 0,
        client: d.client || undefined,
        category: d.category || undefined,
        createdAt: d.createdAt || d.created_at || '',
      })));
    } catch (err: any) {
      console.error("Load requests error:", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvailableRequests();
    }, [loadAvailableRequests])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleAccept = async (item: IncomingRequest) => {
    try {
      setAccepting(item.id);
      await driverService.acceptDelivery(item.id);
      router.replace({
        pathname: '/driver/active-delivery',
        params: { id: String(item.id) },
      });
    } catch (err: any) {
      console.error("Accept error:", err);
      Alert.alert("Error", "Failed to accept delivery");
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (item: IncomingRequest) => {
    try {
      setRejecting(item.id);
      await driverService.rejectDelivery(item.id);
      Alert.alert("Rejected", "Request rejected");
      setRequests((prev) => prev.filter((r) => r.id !== item.id));
    } catch (err: any) {
      console.error("Reject error:", err);
      Alert.alert("Error", "Failed to reject delivery");
    } finally {
      setRejecting(null);
    }
  };

  const renderRequestCard = ({ item, index }: ListRenderItemInfo<IncomingRequest>) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: Animated.multiply(
                slideAnim,
                new Animated.Value(index * 0.1),
              ),
            },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.distanceContainer}>
          <View style={styles.distanceBadge}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.distanceText, { color: colors.primary }]}>
              {item.distance_km ? `${item.distance_km} km` : "—"}
            </Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={colors.grayLight}
          />
          <Text style={[styles.timeText, { color: colors.grayLight }]}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : ""}
          </Text>
        </View>
      </View>

      {/* Route: Pickup → Delivery */}
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
          <View style={styles.routeContent}>
            <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
              Pickup
            </Text>
            <Text style={[styles.routeName, { color: colors.text }]}>
              {item.pickup_address || "—"}
            </Text>
          </View>
        </View>

        <View style={styles.routeLineContainer}>
          <View style={styles.routeLine} />
        </View>

        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.secondary }]} />
          <View style={styles.routeContent}>
            <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
              Delivery
            </Text>
            <Text style={[styles.routeName, { color: colors.text }]}>
              {item.delivery_address || "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Prix */}
      <View style={styles.priceContainer}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
          Estimated Price
        </Text>
        <Text style={[styles.priceValue, { color: colors.secondary }]}>
          {item.estimated_price || item.total_price || "—"} DA
        </Text>
      </View>

      {/* Client */}
      {item.client && (
        <View
          style={[
            styles.customerContainer,
            { borderTopColor: colors.graySoft },
          ]}
        >
          <View style={styles.customerDetail}>
            <View
              style={[
                styles.customerIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Feather name="user" size={12} color={colors.primary} />
            </View>
            <Text style={[styles.customerText, { color: colors.textSecondary }]}>
              {item.client.fullName}
            </Text>
          </View>
          <View style={styles.customerDetail}>
            <View
              style={[
                styles.customerIcon,
                { backgroundColor: colors.warning + "20" },
              ]}
            >
              <Feather name="phone" size={12} color={colors.warning} />
            </View>
            <Text style={[styles.customerText, { color: colors.textSecondary }]}>
              {item.client.phone}
            </Text>
          </View>
        </View>
      )}

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.rejectButton, { borderColor: colors.error }]}
          onPress={() => handleReject(item)}
          disabled={accepting === item.id || rejecting === item.id}
        >
          {rejecting === item.id ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Feather name="x" size={18} color={colors.error} />
              <Text style={[styles.rejectButtonText, { color: colors.error }]}>
                Reject
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            { backgroundColor: colors.secondary },
            accepting === item.id && { opacity: 0.6 },
          ]}
          onPress={() => handleAccept(item)}
          disabled={accepting === item.id || rejecting === item.id}
        >
          {accepting === item.id ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Feather name="check" size={18} color={colors.white} />
              <Text style={[styles.acceptButtonText, { color: colors.white }]}>
                Accept
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SharedHeader title="" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <SharedHeader title="Requests" />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAvailableRequests}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadAvailableRequests}
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={colors.grayLight} />
              <Text style={styles.emptyText}>No incoming requests</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: "#FEE2E2",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.grayLight,
    marginTop: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 10,
  },
  distanceContainer: {
    flexDirection: "row",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  routeContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  routePoint: {
    flexDirection: "row",
    marginBottom: 6,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginTop: 4,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  routeName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 11,
  },
  routeLineContainer: {
    marginLeft: 4,
    marginVertical: 2,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.graySoft,
    borderRadius: 1,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  customerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 14,
  },
  customerDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  customerText: {
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 30,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});