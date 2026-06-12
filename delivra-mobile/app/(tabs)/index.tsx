import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import { deliveryService, statsService } from "@services/api";
import { useAuth } from "@context/AuthContext";
import { AuthGuard } from "@components/AuthGuard";
import { SharedHeader } from "@components/shared/SharedHeader";
import { SectionHeader } from "@components/shared/SectionHeader";
import { DeliveryCard, DeliveryItem } from "@components/client/DeliveryCard";
import { StatsSection, DashboardStats } from "@components/client/StatsSection";
import { CategoryList, Category } from "@components/client/CategoryList";
import { QuickActions } from "@components/client/QuickActions";
import { SpecialOffers, Offer } from "@components/client/SpecialOffers";
import { AboutCard } from "@components/client/AboutCard";
import colors from "@constants/colors";

const categoryImages = {
  documents: "https://i.pinimg.com/1200x/30/82/54/308254a07b8a2ae04718cd567a2c2705.jpg",
  food: "https://i.pinimg.com/1200x/72/d9/af/72d9af964d384fc2a16fd087c1062a7c.jpg",
  electronics: "https://i.pinimg.com/736x/8e/47/31/8e47318579d0592c90dd3a1bbe66580e.jpg",
  clothing: "https://i.pinimg.com/1200x/49/37/4b/49374b0ff961f155d6c3c4beb41db662.jpg",
};

const categories: Category[] = [
  { id: "documents", name: "Documents", image: categoryImages.documents, color: colors.primary, bgColor: colors.primarySoft, icon: "📄" },
  { id: "food", name: "Food", image: categoryImages.food, color: colors.success, bgColor: colors.success + "20", icon: "🍕" },
  { id: "electronics", name: "Electronics", image: categoryImages.electronics, color: colors.primaryLight, bgColor: colors.primarySoft, icon: "📱" },
  { id: "clothing", name: "Clothing", image: categoryImages.clothing, color: colors.success, bgColor: colors.success + "20", icon: "👕" },
];

const OFFERS: Offer[] = [{
  title: "30% OFF",
  subtitle: "On your first delivery order this week",
  buttonLabel: "Order Now →",
  gradientColors: [colors.primary, colors.secondaryLight],
  imageUrl: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
}];

export default function ClientDashboard() {
  return <AuthGuard requiredRole="client"><ClientDashboardContent /></AuthGuard>;
}

function ClientDashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<DeliveryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [deliveriesResult, statsResult] = await Promise.allSettled([
        deliveryService.getClientDeliveries(),
        statsService.getUserStats()
      ]);
      
      const deliveriesRes = deliveriesResult.status === 'fulfilled' ? deliveriesResult.value : null;
      const statsRes = statsResult.status === 'fulfilled' ? statsResult.value : null;
      
      const deliveries: any[] = Array.isArray(deliveriesRes) ? deliveriesRes : (deliveriesRes?.deliveries || []);
      const orders: DeliveryItem[] = deliveries.slice(0, 5).map((d: any) => ({
        id: d.id, category: d.categoryName || d.category_name || "Delivery", driver: d.driverName || d.driver_name || "Assigned",
        status: d.status || "PENDING", date: new Date(d.createdAt || d.created_at).toLocaleDateString(),
        price: `${d.totalPrice || d.price || 0} DA`, icon: iconFor(d.categoryName || d.category_name), bgColor: bgFor(d.categoryName || d.category_name),
      }));
      setRecentOrders(orders);
      
      if (statsRes && typeof statsRes === 'object') {
        const s = statsRes.data || statsRes;
        setStats([
          { label: "Active Orders", value: String(s.activeOrders || 0), color: colors.primary, icon: "package", bg: colors.primarySoft },
          { label: "Completed", value: String(s.completedOrders || 0), color: colors.success, icon: "check-circle", bg: colors.success + "20" },
          { label: "Total Spent", value: `${s.totalSpent || 0} DA`, color: colors.secondary, icon: "dollar-sign", bg: colors.secondarySoft },
        ]);
      } else {
        const active = deliveries.filter((d: any) => d.status === 'pending' || d.status === 'on_the_way' || d.status === 'accepted' || d.status === 'picked_up').length;
        const completed = deliveries.filter((d: any) => d.status === 'delivered').length;
        const spent = deliveries.reduce((s: number, d: any) => s + (d.price || 0), 0);
        setStats([
          { label: "Active Orders", value: String(active), color: colors.primary, icon: "package", bg: colors.primarySoft },
          { label: "Completed", value: String(completed), color: colors.success, icon: "check-circle", bg: colors.success + "20" },
          { label: "Total Spent", value: `${spent} DA`, color: colors.secondary, icon: "dollar-sign", bg: colors.secondarySoft },
        ]);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load data');
      setStats([
        { label: "Active Orders", value: "0", color: colors.primary, icon: "package", bg: colors.primarySoft },
        { label: "Completed", value: "0", color: colors.success, icon: "check-circle", bg: colors.success + "20" },
        { label: "Total Spent", value: "0 DA", color: colors.secondary, icon: "dollar-sign", bg: colors.secondarySoft },
      ]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (user) loadData();
  }, [user?.id]);

  if (loading) return <SafeAreaView style={S.safeArea}><StatusBar barStyle="light-content" backgroundColor={colors.secondaryDark} /><View style={S.loading}><ActivityIndicator size="large" color={colors.primary} /></View></SafeAreaView>;

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={S.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondaryDark} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scroll}>
        {error && (
          <View style={S.errorContainer}>
            <Text style={S.errorText}>{error}</Text>
            <TouchableOpacity style={S.retryButton} onPress={loadData}>
              <Text style={S.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <SharedHeader
          userName={userName}
          subtitle="Fast delivery at your service"
          showAvatar={true}
          notificationCount={3}
          onNotificationPress={() => router.push({ pathname: "/client/notifications" })}
        />

        <Animated.View style={{ opacity: fadeAnim }}><AboutCard /></Animated.View>
        <TouchableOpacity style={S.createBtn} activeOpacity={0.9} onPress={() => router.push({ pathname: "/client/create-delivery/step1-category" })}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.createGrad}>
            <Feather name="plus-circle" size={22} color={colors.white} /><Text style={S.createText}>Create New Delivery</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim }}><StatsSection stats={stats} /></Animated.View>
        <Animated.View style={{ opacity: fadeAnim }}><CategoryList categories={categories} /></Animated.View>
        <Animated.View style={{ opacity: fadeAnim }}><QuickActions onActionPress={() => {}} /></Animated.View>
        <Animated.View style={{ opacity: fadeAnim }}><SpecialOffers offers={OFFERS} /></Animated.View>

        <Animated.View style={[S.recent, { opacity: fadeAnim }]}>
          <SectionHeader
            icon="📋"
            title="Recent Orders"
            showSeeAll={true}
            onSeeAll={() => router.push({ pathname: "/client/my-orders" })}
          />
          {recentOrders.map((o) => <DeliveryCard key={o.id} delivery={o} />)}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const iconFor = (cat: string) => ({ documents: "📄", food: "🍕", electronics: "📱", clothing: "👕" } as Record<string, string>)[cat?.toLowerCase()] || "📦";
const bgFor = (cat: string) => ({ documents: colors.primarySoft, food: colors.secondarySoft, electronics: colors.primarySoft, clothing: colors.success + "20" } as Record<string, string>)[cat?.toLowerCase()] || colors.background;

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorContainer: { backgroundColor: '#FEE2E2', padding: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center' },
  retryButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  scroll: { paddingBottom: 30 },
  createBtn: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6, borderRadius: 32, overflow: "hidden" },
  createGrad: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, paddingVertical: 16 },
  createText: { color: colors.white, fontSize: 16, fontWeight: "bold" },
  recent: { marginTop: 24, paddingHorizontal: 16, marginBottom: 20 },
});