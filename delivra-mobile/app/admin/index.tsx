import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useAuth } from "@context/AuthContext";
import { SharedHeader } from "@components/shared/SharedHeader";
import { SectionHeader } from "@components/shared/SectionHeader";
import { StatusBadge } from "@components/shared/StatusBadge";
import { ActionCard } from "@components/shared/ActionCard";
import { adminService } from "@services/api";
import colors from "@constants/colors";

export default function AdminDashboard() {
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: "users", color: colors.secondary, bg: colors.secondarySoft },
    { label: "Total Drivers", value: "0", icon: "truck", color: colors.success, bg: colors.success + "20" },
    { label: "Total Orders", value: "0", icon: "shopping-bag", color: colors.primary, bg: colors.primarySoft },
    { label: "Revenue", value: "0 DA", icon: "dollar-sign", color: colors.secondary, bg: colors.secondarySoft },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentDrivers, setRecentDrivers] = useState<any[]>([]);

  const quickActions = [
    { id: "users", title: "Manage Users", icon: "users", route: "/admin/users", color: colors.secondary, bg: colors.secondarySoft },
    { id: "drivers", title: "Manage Drivers", icon: "truck", route: "/admin/drivers", color: colors.success, bg: colors.success + "20" },
  ];

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboard();
      
      if (data) {
        setStats([
          { label: "Total Users", value: String(data.total_users || 0), icon: "users", color: colors.secondary, bg: colors.secondarySoft },
          { label: "Total Drivers", value: String(data.total_drivers || 0), icon: "truck", color: colors.success, bg: colors.success + "20" },
          { label: "Total Orders", value: String(data.total_deliveries || 0), icon: "shopping-bag", color: colors.primary, bg: colors.primarySoft },
          { label: "Revenue", value: `${(data.total_revenue || 0).toLocaleString()} DA`, icon: "dollar-sign", color: colors.secondary, bg: colors.secondarySoft },
        ]);
        setRecentOrders(data.recent_orders || []);
        setRecentDrivers(data.recent_drivers || []);
      }
    } catch (err: any) {
      console.error('Error loading admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadDashboard();
  }, []);

  const userName = user?.full_name || user?.email?.split('@')[0] || 'Admin';

  const profileIcon = (
    <TouchableOpacity style={styles.headerIcon} onPress={() => router.push({ pathname: "/admin/profile" })}>
      <Feather name="user" size={22} color={colors.white} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.secondaryDark} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondaryDark} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          userName={userName}
          subtitle="Manage your platform"
          notificationCount={4}
          onNotificationPress={() => router.push({ pathname: "/admin/notifications" })}
          rightContent={profileIcon}
        />

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCell}>
                <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                  <Feather name={stat.icon as React.ComponentProps<typeof Feather>['name']} size={22} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <SectionHeader title="⚡ Quick Actions" />
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <View key={action.id} style={styles.actionCell}>
                <ActionCard
                  icon={action.icon}
                  label={action.title}
                  color={action.color}
                  bg={action.bg}
                  onPress={() => router.push({ pathname: action.route } as any)}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <SectionHeader
            icon="📋"
            title="Recent Orders"
            showSeeAll={true}
            onSeeAll={() => router.push({ pathname: "/admin/orders" })}
          />
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <StatusBadge status={order.status} />
              </View>
              <View style={styles.orderRow}>
                <Feather name="user" size={12} color={colors.textSecondary} />
                <Text style={styles.orderCustomer}>{order.customer}</Text>
              </View>
              <View style={styles.orderRow}>
                <Feather name="truck" size={12} color={colors.textSecondary} />
                <Text style={styles.orderDriver}>{order.driver}</Text>
              </View>
              <Text style={styles.orderAmount}>{order.amount}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <SectionHeader
            icon="🚚"
            title="New Driver Requests"
            showSeeAll={true}
            onSeeAll={() => router.push({ pathname: "/admin/drivers" })}
          />
          {recentDrivers.map((driver) => (
            <View key={driver.id} style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <View style={styles.driverAvatarBg}>
                  <Feather name="user" size={24} color={colors.secondary} />
                </View>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverEmail}>{driver.email}</Text>
                <Text style={styles.driverVehicle}>🚗 {driver.vehicle}</Text>
              </View>
              <StatusBadge status="pending" />
            </View>
          ))}
        </Animated.View>
      </ScrollView>
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
  section: { marginTop: 16, paddingHorizontal: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  statCell: { width: "48%", backgroundColor: colors.white, borderRadius: 20, padding: 14, alignItems: "center", shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, textAlign: "center" },
  actionsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actionCell: { flex: 1 },
  headerIcon: { padding: 4 },
  orderCard: { backgroundColor: colors.white, borderRadius: 20, marginBottom: 12, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: "600", color: colors.black },
  orderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  orderCustomer: { fontSize: 13, color: colors.black },
  orderDriver: { fontSize: 13, color: colors.textSecondary },
  orderAmount: { fontSize: 16, fontWeight: "bold", color: colors.primary, marginTop: 4 },
  orderDate: { fontSize: 11, color: colors.grayLight, marginTop: 2 },
  driverCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: 20, marginBottom: 12, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  driverAvatar: { marginRight: 12 },
  driverAvatarBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.secondarySoft, justifyContent: "center", alignItems: "center" },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: "600", color: colors.black },
  driverEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  driverVehicle: { fontSize: 11, marginTop: 2, color: colors.textSecondary },
});