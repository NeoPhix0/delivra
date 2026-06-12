import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";
import { driverService } from "@services/api";

export default function EarningsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const loadEarnings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [earningsRes, statsRes] = await Promise.all([
        driverService.getEarnings('month'),
        driverService.getEarningsStats(),
      ]);

      // Transform earnings data — after adaptKeys(): { earnings: { todayEarnings, weekEarnings, monthEarnings } }
      const earningsData = statsRes?.earnings || statsRes || {};
      setEarnings({
        today: earningsData.todayEarnings || earningsData.today_earnings || 0,
        week: earningsData.weekEarnings || earningsData.week_earnings || 0,
        month: earningsData.monthEarnings || earningsData.month_earnings || 0,
        total: (earningsData.todayEarnings || earningsData.today_earnings || 0) + (earningsData.weekEarnings || earningsData.week_earnings || 0) + (earningsData.monthEarnings || earningsData.month_earnings || 0),
      });

      // Transform transactions
      const transactions = Array.isArray(earningsRes) ? earningsRes : (earningsRes?.transactions || []);
      setRecentTransactions(
        transactions.map((t: any, index: number) => ({
          id: t.id || String(index),
          date: t.date || new Date(t.created_at).toLocaleString(),
          amount: t.amount || 0,
          orderId: t.order_id || `#DEL-${(t.id || '').substring(0, 8)}`,
          status: t.status || 'completed',
        }))
      );
    } catch (err: any) {
      console.error('Error loading earnings:', err);
      setError(err.message || 'Failed to load earnings');
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
  }, []);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader title="Earnings" />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEarnings}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Total Card */}
        <Animated.View
          style={[styles.totalCard, { opacity: fadeAnim, marginTop: 16 }]}
        >
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalGradient}
          >
            <Text style={[styles.totalLabel, { color: colors.white + "CC" }]}>
              Total Earnings
            </Text>
            <Text style={[styles.totalValue, { color: colors.white }]}>
              {earnings.total.toLocaleString()} DA
            </Text>
            <Text style={[styles.totalSubtext, { color: colors.white + "CC" }]}>
              Lifetime earnings
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={[styles.statBlock, { backgroundColor: colors.white }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + "20" }]}>
              <Feather name="trending-up" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {earnings.today.toLocaleString()} DA
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
          </View>
          <View style={[styles.statBlock, { backgroundColor: colors.white }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name="calendar" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {earnings.week.toLocaleString()} DA
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              This Week
            </Text>
          </View>
          <View style={[styles.statBlock, { backgroundColor: colors.white }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name="clock" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {earnings.month.toLocaleString()} DA
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              This Month
            </Text>
          </View>
        </Animated.View>

        {/* Withdraw Button */}
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => router.push("/driver/withdraw-earnings")}
        >
          <View
            style={[styles.withdrawBtnInner, { backgroundColor: colors.secondary }]}
          >
            <Feather name="credit-card" size={18} color={colors.white} />
            <Text style={[styles.withdrawText, { color: colors.white }]}>
              Withdraw Earnings
            </Text>
          </View>
        </TouchableOpacity>

        {/* Transactions Section */}
        <Animated.View
          style={[styles.transactionsSection, { opacity: fadeAnim }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Transactions
          </Text>
          {recentTransactions.map((transaction) => (
            <View
              key={transaction.id}
              style={[styles.transactionCard, { backgroundColor: colors.white }]}
            >
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        transaction.status === "completed"
                          ? colors.success + "20"
                          : colors.warning + "20",
                    },
                  ]}
                >
                  <Feather
                    name={
                      transaction.status === "completed"
                        ? "check-circle"
                        : "clock"
                    }
                    size={18}
                    color={
                      transaction.status === "completed" ? colors.success : colors.warning
                    }
                  />
                </View>
                <View>
                  <Text style={[styles.transactionOrder, { color: colors.text }]}>
                    {transaction.orderId}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.grayLight }]}>
                    {transaction.date}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.status === "completed"
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                +{transaction.amount.toLocaleString()} DA
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.grayLight },
  errorContainer: { backgroundColor: '#FEE2E2', padding: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center' },
  retryButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  totalCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  totalGradient: { padding: 24, alignItems: "center" },
  totalLabel: { fontSize: 14, marginBottom: 8 },
  totalValue: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  totalSubtext: { fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 14, fontWeight: "bold", marginBottom: 2 },
  statLabel: { fontSize: 10 },
  withdrawBtn: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 40,
    overflow: "hidden",
  },
  withdrawBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  withdrawText: { fontSize: 15, fontWeight: "bold" },
  transactionsSection: { marginHorizontal: 16, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionOrder: { fontSize: 14, fontWeight: "500" },
  transactionDate: { fontSize: 11, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: "bold" },
});