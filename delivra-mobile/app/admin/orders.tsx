import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { adminService } from "@services/api";

interface AdminOrder {
  id: string;
  customer: string;
  driver: string;
  amount: string;
  status: string;
  date: string;
  pickup: string;
  delivery: string;
}

export default function OrdersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOrders();
      const items = Array.isArray(data) ? data : (data?.orders || []);
      const transformed: AdminOrder[] = items.map((o: any, index: number) => ({
        id: o.id || `#DEL-${String(index + 1).padStart(3, '0')}`,
        customer: o.customer || o.customer_name || 'Unknown',
        driver: o.driver || o.driver_name || 'Unassigned',
        amount: o.amount ? `${Number(o.amount).toLocaleString()} DA` : '0 DA',
        status: o.status || 'pending',
        date: o.date || (o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : ''),
        pickup: o.pickup || o.pickup_address || 'Unknown',
        delivery: o.delivery || o.delivery_address || 'Unknown',
      }));
      setOrders(transformed);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "on_the_way":
        return colors.primary;
      case "pending":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success + "20";
      case "on_the_way":
        return colors.primarySoft;
      case "pending":
        return colors.warning + "20";
      default:
        return colors.borderLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "on_the_way":
        return "In Transit";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const handleUpdateStatus = (order: AdminOrder) => {
    const statuses = ["pending", "picked_up", "on_the_way", "completed"];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    Alert.alert(
      "Update Status",
      `Change order ${order.id} status to ${getStatusText(nextStatus)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              setUpdatingId(order.id);
              await adminService.updateOrderStatus(order.id, nextStatus);
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === order.id ? { ...o, status: nextStatus } : o,
                ),
              );
              Alert.alert("Success", "Order status updated");
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || "Failed to update order status");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ],
    );
  };
  
  const renderOrderCard = ({ item }: ListRenderItemInfo<AdminOrder>) => (
    <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.primary }]}>{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(item.status) },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.orderBody}>
        <View style={styles.orderRow}>
          <Feather name="user" size={12} color={colors.textSecondary} />
          <Text style={styles.orderValue}>{item.customer}</Text>
        </View>
        <View style={styles.orderRow}>
          <Feather name="truck" size={12} color={colors.textSecondary} />
          <Text style={styles.orderValue}>{item.driver}</Text>
        </View>
        <View style={styles.orderRow}>
          <Feather name="map-pin" size={12} color={colors.textSecondary} />
          <Text style={styles.orderValue}>
            {item.pickup} → {item.delivery}
          </Text>
        </View>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={[styles.orderAmount, { color: colors.secondary }]}>
          {item.amount}
        </Text>
        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: updatingId === item.id ? colors.grayLight : colors.primary }]}
          onPress={() => handleUpdateStatus(item)}
          disabled={updatingId === item.id}
        >
          {updatingId === item.id ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Feather name="refresh-cw" size={12} color={colors.white} />
              <Text style={styles.updateButtonText}>Update</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={colors.grayLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID or customer..."
          placeholderTextColor={colors.grayLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "all" && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "pending" && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "pending" && styles.filterTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "on_the_way" && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter("on_the_way")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "on_the_way" && styles.filterTextActive,
            ]}
          >
            In Transit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "completed" && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === "completed" && styles.filterTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { backgroundColor: '#FEE2E2', padding: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center' },
  retryButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 12, color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: { fontSize: 14, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "500" },
  orderBody: { marginBottom: 12 },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  orderValue: { fontSize: 13, color: colors.text },
  orderDate: { fontSize: 11, color: colors.grayLight, marginTop: 6 },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderAmount: { fontSize: 18, fontWeight: "bold" },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  updateButtonText: { color: colors.white, fontSize: 11, fontWeight: "500" },
});
