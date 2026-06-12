import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deliveryService } from "@services/api";

interface DeliveryHistoryItem {
  id: string;
  orderId: string;
  date: string;
  time: string;
  pickup: string;
  delivery: string;
  amount: string;
  status: string;
  rating: number | null;
}

export default function DeliveryHistoryScreen() {
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">(
    "all",
  );
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (filter === 'completed') {
        filters.status = 'DELIVERED';
      } else if (filter === 'cancelled') {
        filters.status = 'CANCELLED';
      }
      const data = await deliveryService.getDeliveryHistory(filters);
      
      // Transform API data to match the UI structure
      const transformedData = data.deliveries.map((d: any) => ({
        id: d.id,
        orderId: `#DEL-${String(d.id).padStart(6, '0')}`,
        date: new Date(d.createdAt || d.created_at).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        }),
        time: new Date(d.createdAt || d.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit' 
        }),
        pickup: d.pickupAddress || d.pickup_address || 'Unknown',
        delivery: d.deliveryAddress || d.delivery_address || 'Unknown',
        amount: `${d.totalPrice || d.total_price || 0} DA`,
        status: d.status,
        rating: d.rating || null,
      }));
      
      setDeliveries(transformedData);
    } catch (err: any) {
      console.error("Load deliveries error:", err);
      setError(err.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const filteredDeliveries = deliveries.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading deliveries...</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) =>
    status === "completed" || status === "COMPLETED" || status === "DELIVERED" ? colors.success : colors.error;
  const getStatusText = (status: string) =>
    status === "completed" || status === "COMPLETED" || status === "DELIVERED" ? "Completed" : "Cancelled";

  const renderDeliveryCard = ({ item }: ListRenderItemInfo<DeliveryHistoryItem>) => (
    <Animated.View style={[styles.deliveryCard, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => router.push("/driver/order-details")}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.orderId, { color: colors.primary }]}>
            {item.orderId}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.text }]}>
              {item.pickup}
            </Text>
          </View>
          <View style={styles.arrowIcon}>
            <Feather name="arrow-down" size={14} color={colors.grayLight} />
          </View>
          <View style={styles.locationRow}>
            <Feather name="home" size={14} color={colors.secondary} />
            <Text style={[styles.locationText, { color: colors.text }]}>
              {item.delivery}
            </Text>
          </View>
        </View>
        <View style={[styles.cardFooter, { borderTopColor: colors.graySoft }]}>
          <View>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {item.date} • {item.time}
            </Text>
            {item.rating && (
              <Text style={[styles.ratingText, { color: colors.warning }]}>
                ⭐ {item.rating}/5
              </Text>
            )}
          </View>
          <Text style={[styles.amountText, { color: colors.secondary }]}>
            {item.amount}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterActive,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "completed" && styles.filterTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "cancelled" && styles.filterActive,
          ]}
          onPress={() => setFilter("cancelled")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "cancelled" && styles.filterTextActive,
            ]}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDeliveries}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredDeliveries}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.white },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.graySoft,
  },
  filterActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  filterTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  orderId: { fontSize: 14, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "500" },
  cardBody: { marginBottom: 12 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  locationText: { fontSize: 14, flex: 1 },
  arrowIcon: { marginLeft: 22, marginVertical: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dateText: { fontSize: 11 },
  ratingText: { fontSize: 11, marginTop: 4 },
  amountText: { fontSize: 16, fontWeight: "bold" },
});