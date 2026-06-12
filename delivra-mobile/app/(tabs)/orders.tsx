import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
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
  category: string;
  driver: string;
  status: string;
  date: string;
  price: string;
  pickup: string;
  delivery: string;
}

export default function MyOrdersScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [loading, setLoading] = useState(true);
  const [ordersData, setOrdersData] = useState<{
    active: Order[];
    completed: Order[];
    cancelled: Order[];
  }>({
    active: [],
    completed: [],
    cancelled: [],
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
  }, [fadeAnim, headerSlide, orbAnim1, orbAnim2]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getClientDeliveries();
      const deliveries: any[] = Array.isArray(response) ? response : (response?.deliveries || []);

      const active = deliveries.filter((d: any) => {
        const s = (d.status || '').toUpperCase();
        return s === 'PENDING' || s === 'ACCEPTED' || s === 'PICKED_UP' || s === 'ON_THE_WAY';
      }).map((d: any) => formatOrder(d));

      const completed = deliveries.filter((d: any) => (d.status || '').toUpperCase() === 'DELIVERED').map((d: any) => formatOrder(d));
      const cancelled = deliveries.filter((d: any) => (d.status || '').toUpperCase() === 'CANCELLED').map((d: any) => formatOrder(d));

      setOrdersData({ active, completed, cancelled });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOrder = (delivery: any): Order => ({
    id: String(delivery.id),
    category: delivery.category?.displayName || delivery.category?.name || 'Delivery',
    driver: delivery.driver?.fullName || 'Assigned',
    status: formatStatus((delivery.status || '').toLowerCase()),
    date: delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : '',
    price: `${delivery.totalPrice || delivery.estimated_price || 0} DA`,
    pickup: delivery.pickupAddress || 'Pickup',
    delivery: delivery.deliveryAddress || 'Delivery',
  });

  const formatStatus = (status: string) => {
    const normalized = (status || '').toLowerCase();
    const statusMap: Record<string, string> = {
      pending: 'Preparing',
      accepted: 'In Transit',
      picked_up: 'Picked Up',
      on_the_way: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[normalized] || normalized;
  };

  const getStatusColor = (status: string) => {
    if (status === "Delivered") return colors.success;
    if (status === "In Transit" || status === "Preparing")
      return colors.secondary;
    if (status === "Cancelled") return colors.error;
    return colors.warning;
  };

  const getStatusBgColor = (status: string) => {
    if (status === "Delivered") return colors.success + "15";
    if (status === "In Transit" || status === "Preparing")
      return colors.secondary + "15";
    if (status === "Cancelled") return colors.error + "15";
    return colors.warning + "15";
  };

  const handleViewDetails = (order: Order) => {
    if (["Preparing", "In Transit", "Picked Up", "On the Way"].includes(order.status)) {
      router.push({ pathname: "/client/order-tracking", params: { id: order.id } });
    } else if (order.status === "Delivered") {
      router.push("/client/rating" as import('expo-router').Href);
    }
  };

  const renderOrderCard = ({ item }: ListRenderItemInfo<Order>) => (
    <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colors.white, colors.background]}
          style={styles.orderGradient}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderIcon}>
              <Feather name={"package" as React.ComponentProps<typeof Feather>['name']} size={22} color={colors.secondary} />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderCategory}>{item.category}</Text>
              <Text style={styles.orderDriver}>
                {item.driver} • {item.date}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBgColor(item.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.orderPrice}>{item.price}</Text>
          </View>
          <View style={styles.orderFooter}>
            <View style={styles.locationRow}>
              <Feather name={"map-pin" as React.ComponentProps<typeof Feather>['name']} size={12} color={colors.gray} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.pickup} → {item.delivery}
              </Text>
            </View>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>View Details →</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

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

      <SharedHeader
        title="My Orders"
        subtitle="Track your deliveries"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

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

      <FlatList
        data={ordersData[activeTab]}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: "500", color: colors.gray },
  tabTextActive: { color: colors.white },
  tabBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 22,
    alignItems: "center",
  },
  tabBadgeActive: { backgroundColor: colors.white },
  tabBadgeText: { fontSize: 10, fontWeight: "bold", color: colors.primary },
  tabBadgeTextActive: { color: colors.primary },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },

  // Order Card
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
  orderGradient: { padding: 16 },
  orderHeader: { flexDirection: "row", marginBottom: 12 },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderInfo: { flex: 1 },
  orderCategory: { fontSize: 15, fontWeight: "600", color: colors.black },
  orderDriver: { fontSize: 12, color: colors.gray, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 10, fontWeight: "500" },
  orderPrice: { fontSize: 16, fontWeight: "bold", color: colors.secondary },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.graySoft,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  locationText: { fontSize: 11, color: colors.gray, flex: 1 },
  detailsButton: { paddingHorizontal: 10, paddingVertical: 4 },
  detailsButtonText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: "500",
  },
});
