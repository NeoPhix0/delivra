import colors from "@constants/colors";
// app/client/my-orders.tsx
// نسخة محسنة بالكامل - متناسقة مع التصميم العام

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { deliveryService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";


type TabType = "active" | "completed" | "cancelled";

interface Order {
  id: string;
  status: string;
  category: string;
  driver: string;
  date: string;
  price: string;
  pickup: string;
  delivery: string;
}

export default function MyOrdersScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersData, setOrdersData] = useState<any>({
    active: [],
    completed: [],
    cancelled: [],
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryService.getClientDeliveries();
      const deliveries: any[] = Array.isArray(response) ? response : (response?.deliveries || []);

      const active = deliveries.filter((d: any) => {
        const s = (d.status || '').toUpperCase();
        return s === 'PENDING' || s === 'ACCEPTED' || s === 'PICKED_UP' || s === 'ON_THE_WAY';
      }).map((d: any) => formatOrder(d));

      const completed = deliveries.filter((d: any) => (d.status || '').toUpperCase() === 'DELIVERED').map((d: any) => formatOrder(d));
      const cancelled = deliveries.filter((d: any) => (d.status || '').toUpperCase() === 'CANCELLED').map((d: any) => formatOrder(d));

      setOrdersData({ active, completed, cancelled });
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatOrder = (delivery: any) => ({
    id: delivery.id,
    category: delivery.category_name || 'Delivery',
    driver: delivery.driver_name || 'Assigned',
    status: formatStatus(delivery.status),
    date: new Date(delivery.created_at).toLocaleDateString(),
    price: `${delivery.price || 0} DA`,
    pickup: delivery.pickup_address || 'Pickup',
    delivery: delivery.delivery_address || 'Delivery',
  });

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Preparing',
      accepted: 'In Transit',
      picked_up: 'Picked Up',
      on_the_way: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === "Delivered") return colors.success;
    if (status === "In Transit" || status === "Preparing")
      return colors.primary;
    if (status === "Cancelled") return colors.error;
    return colors.warning;
  };

  const getStatusBgColor = (status: string) => {
    if (status === "Delivered") return colors.success + "15";
    if (status === "In Transit" || status === "Preparing")
      return colors.primary + "15";
    if (status === "Cancelled") return colors.error + "15";
    return colors.warning + "15";
  };

  const handleViewDetails = (order: any) => {
    if (["Preparing", "In Transit", "Picked Up", "On the Way"].includes(order.status)) {
      router.push({ pathname: "/client/order-tracking", params: { id: order.id } });
    } else if (order.status === "Delivered") {
      router.push("/client/rating" as import('expo-router').Href);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <SharedHeader
        title="My Orders"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(["active", "completed", "cancelled"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "active"
                ? "Active"
                : tab === "completed"
                  ? "Completed"
                  : "Cancelled"}
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === tab && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === tab && styles.tabBadgeTextActive,
                ]}
              >
                {ordersData[tab].length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {ordersData[activeTab].map((order: Order, index: number) => (
          <Animated.View
            key={order.id}
            style={[
              styles.orderCard,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleViewDetails(order)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.white, colors.background]}
                style={styles.orderGradient}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderIcon}>
                    <Feather name="package" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCategory}>{order.category}</Text>
                    <Text style={styles.orderDriver}>
                      {order.driver} • {order.date}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(order.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderPrice}>{order.price}</Text>
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={12} color={colors.gray} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {order.pickup} → {order.delivery}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Details →</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.white,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: colors.graySoft,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 22,
    alignItems: "center",
  },
  tabBadgeActive: {
    backgroundColor: colors.white,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
  },
  tabBadgeTextActive: {
    color: colors.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderGradient: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderCategory: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  orderDriver: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.graySoft,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: colors.gray,
    flex: 1,
  },
  detailsButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailsButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
});
