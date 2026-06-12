import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated, ScrollView, StatusBar, StyleSheet, Switch,
  Text, TouchableOpacity, View,
} from "react-native";
import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { SharedHeader } from "@components/shared/SharedHeader";
import { SectionHeader } from "@components/shared/SectionHeader";
import { ActionCard } from "@components/shared/ActionCard";
import { statsService, driverService } from "@services/api";
import colors from "@constants/colors";

export default function DriverDashboard() {
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResult, deliveriesResult] = await Promise.allSettled([
        statsService.getDriverStats(),
        driverService.getAvailableDeliveries()
      ]);
      
      const statsRes = statsResult.status === 'fulfilled' ? statsResult.value : null;
      const deliveriesRes = deliveriesResult.status === 'fulfilled' ? deliveriesResult.value : null;
      
      if (statsRes && typeof statsRes === 'object') {
        const s = statsRes.data || statsRes;
        const earnings = s.earnings || s;
        setStats([
          { label: "Today's Earnings", value: `${earnings.todayEarnings || earnings.today_earnings || 0} DA`, color: colors.success, bg: colors.success + "20", icon: "trending-up" },
          { label: "Completed Today", value: String(s.completedDeliveries || s.completed_deliveries || 0), color: colors.secondary, bg: colors.secondarySoft, icon: "check-circle" },
          { label: "Weekly Earnings", value: `${earnings.weekEarnings || earnings.week_earnings || 0} DA`, color: colors.primary, bg: colors.primarySoft, icon: "calendar" },
          { label: "Rating", value: `${s.averageRating || s.average_rating || 0} ⭐`, color: colors.warning, bg: colors.warning + "20", icon: "star" },
        ]);
      } else {
        setStats([
          { label: "Today's Earnings", value: "0 DA", color: colors.success, bg: colors.success + "20", icon: "trending-up" },
          { label: "Completed Today", value: "0", color: colors.secondary, bg: colors.secondarySoft, icon: "check-circle" },
          { label: "Weekly Earnings", value: "0 DA", color: colors.primary, bg: colors.primarySoft, icon: "calendar" },
          { label: "Rating", value: "0 ⭐", color: colors.warning, bg: colors.warning + "20", icon: "star" },
        ]);
      }
      
      const rawDeliveries: any[] = Array.isArray(deliveriesRes) 
        ? deliveriesRes 
        : (deliveriesRes?.deliveries || []);

      const mappedDeliveries = rawDeliveries.map((d: any) => ({
        id: d.id,
        pickup: d.pickupAddress || d.pickup_address || '—',
        delivery: d.deliveryAddress || d.delivery_address || '—',
        amount: `${d.totalPrice || d.total_price || 0} DA`,
        customer: d.client?.fullName || d.client?.full_name || '—',
        time: d.createdAt 
          ? new Date(d.createdAt).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })
          : '—',
        distance: '—',
        status: d.status,
        trackingNumber: d.trackingNumber || d.tracking_number || '',
      }));

      setIncomingRequests(mappedDeliveries.slice(0, 3));
      setRecentDeliveries(mappedDeliveries.slice(0, 3));
    } catch (err: any) {
      console.error('Error loading driver dashboard:', err);
      setError(err.message || 'Failed to load data');
      setStats([
        { label: "Today's Earnings", value: "0 DA", color: colors.success, bg: colors.success + "20", icon: "trending-up" },
        { label: "Completed Today", value: "0", color: colors.secondary, bg: colors.secondarySoft, icon: "check-circle" },
        { label: "Weekly Earnings", value: "0 DA", color: colors.primary, bg: colors.primarySoft, icon: "calendar" },
        { label: "Rating", value: "0 ⭐", color: colors.warning, bg: colors.warning + "20", icon: "star" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: { id: string; title: string; icon: string; route: Href; color: string; bg: string }[] = [
    { id: "active", title: "Active", icon: "truck", route: "/driver/active-delivery" as Href, color: colors.secondary, bg: colors.secondarySoft },
    { id: "history", title: "History", icon: "clock", route: "/driver/delivery-history" as Href, color: colors.textSecondary, bg: colors.background },
    { id: "withdraw", title: "Withdraw", icon: "credit-card", route: "/driver/withdraw-earnings" as Href, color: colors.success, bg: colors.success + "20" },
    { id: "ratings", title: "Ratings", icon: "star", route: "/driver/ratings-reviews" as Href, color: colors.warning, bg: colors.warning + "20" },
    { id: "earnings", title: "Earnings", icon: "bar-chart-2", route: "/driver/earnings" as Href, color: colors.primary, bg: colors.primarySoft },
    { id: "profile", title: "Profile", icon: "user", route: "/driver/profile" as Href, color: colors.secondary, bg: colors.secondarySoft },
  ];

  const userName = user?.full_name || user?.email?.split('@')[0] || 'Driver';

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

  const onlineToggle = (
    <View style={styles.toggle}>
      <Switch
        value={isOnline}
        onValueChange={setIsOnline}
        trackColor={{ false: colors.white + "80", true: colors.white }}
        thumbColor={colors.white}
      />
      <Text style={[styles.toggleText, { color: isOnline ? colors.success : colors.white + "CC" }]}>
        {isOnline ? "Online" : "Offline"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondaryDark} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <SharedHeader
          userName={userName}
          subtitle="Ready to deliver?"
          notificationCount={3}
          onNotificationPress={() => router.push("/driver/notifications")}
          rightContent={onlineToggle}
        />

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCell}>
                <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                  <Feather name={stat.icon as any} size={22} color={stat.color} />
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
                  onPress={() => router.push(action.route)}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <SectionHeader
            icon="📋"
            title="Incoming Requests"
            showSeeAll={true}
            onSeeAll={() => router.push("/driver/incoming-requests")}
          />
          {incomingRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestLeft}>
                  <Text style={styles.requestPickup}>{request.pickup}</Text>
                  <Text style={styles.requestDelivery}>{request.delivery}</Text>
                  <View style={styles.requestMeta}>
                    <Feather name="clock" size={12} color={colors.textSecondary} />
                    <Text style={styles.requestMetaText}>{request.time}</Text>
                    <Feather name="map-pin" size={12} color={colors.secondary} />
                    <Text style={[styles.requestMetaText, { color: colors.secondary }]}>{request.distance}</Text>
                  </View>
                </View>
                <Text style={styles.requestAmount}>{request.amount}</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.rejectBtn}>
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <SectionHeader icon="✅" title="Recent Deliveries" />
          {recentDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryLeft}>
                <View style={styles.deliveryIcon}>
                  <Feather name="check-circle" size={18} color={colors.success} />
                </View>
                <View>
                  <Text style={styles.deliveryCustomer}>{delivery.customer}</Text>
                  <Text style={styles.deliveryTime}>{delivery.time}</Text>
                </View>
              </View>
              <Text style={[styles.deliveryAmount, { color: colors.success }]}>{delivery.amount}</Text>
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
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  actionCell: { width: "31%" },
  toggle: { flexDirection: "row", alignItems: "center", gap: 6 },
  toggleText: { fontSize: 12, fontWeight: "500" },
  requestCard: { backgroundColor: colors.white, borderRadius: 20, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  requestLeft: { flex: 1 },
  requestPickup: { fontSize: 15, fontWeight: "600", color: colors.black, marginBottom: 2 },
  requestDelivery: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  requestMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  requestMetaText: { fontSize: 11, color: colors.textSecondary, marginRight: 8 },
  requestAmount: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  requestActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  rejectBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.error },
  rejectBtnText: { color: colors.error, fontSize: 12, fontWeight: "500" },
  acceptBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.primary },
  acceptBtnText: { color: colors.white, fontSize: 12, fontWeight: "500" },
  deliveryCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, borderRadius: 16, marginBottom: 8, padding: 12, borderWidth: 1, borderColor: colors.border },
  deliveryLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  deliveryIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success + "20", justifyContent: "center", alignItems: "center" },
  deliveryCustomer: { fontSize: 14, fontWeight: "500", color: colors.black },
  deliveryTime: { fontSize: 11, marginTop: 2, color: colors.textSecondary },
  deliveryAmount: { fontSize: 15, fontWeight: "bold", color: colors.success },
});