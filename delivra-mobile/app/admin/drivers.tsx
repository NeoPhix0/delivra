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

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  plate: string;
  zone: string;
  status: string;
  rating: number;
  joined: string;
}

export default function DriversScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "blocked">("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers({ role: 'DRIVER' });
      const items = Array.isArray(data) ? data : (data?.users || []);
      const transformed: Driver[] = items.map((d: any, index: number) => ({
        id: d.id || String(index),
        name: d.name || d.full_name || 'Unknown',
        email: d.email || '',
        phone: d.phone || '',
        vehicle: d.vehicle || d.vehicle_type || 'Motorcycle',
        plate: d.vehicle_plate || d.plate || 'N/A',
        zone: d.zone || d.working_zone || 'Unknown',
        status: d.status || 'pending',
        rating: d.rating || d.average_rating || 0,
        joined: d.joined || (d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : ''),
      }));
      setDrivers(transformed);
    } catch (err: any) {
      console.error('Error loading drivers:', err);
      setError(err.message || 'Failed to load drivers');
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
    loadDrivers();
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || driver.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApproveDriver = (driver: Driver) => {
    Alert.alert("Approve Driver", `Approve ${driver.name} as a driver?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          setDrivers((prev) =>
            prev.map((d) =>
              d.id === driver.id ? { ...d, status: "approved" } : d,
            ),
          );
          Alert.alert("Success", "Driver approved successfully");
        },
      },
    ]);
  };

  const handleRejectDriver = (driver: Driver) => {
    Alert.alert("Reject Driver", `Reject ${driver.name}'s application?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
          Alert.alert("Success", "Driver application rejected");
        },
      },
    ]);
  };

  const renderDriverCard = ({ item }: ListRenderItemInfo<Driver>) => (
    <Animated.View style={[styles.driverCard, { opacity: fadeAnim }]}>
      <View style={styles.driverAvatar}>
        <View style={[styles.driverAvatarBg, { backgroundColor: colors.primarySoft }]}>
          <Feather name="user" size={24} color={colors.primary} />
        </View>
      </View>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.name}</Text>
        <Text style={styles.driverEmail}>{item.email}</Text>
        <Text style={styles.driverDetails}>
          🚗 {item.vehicle} • {item.plate}
        </Text>
        <Text style={styles.driverDetails}>
          📍 {item.zone} • {item.rating > 0 ? `⭐ ${item.rating}` : "New"}
        </Text>
      </View>
      <View style={styles.driverActions}>
        <View
          style={[
            styles.statusBadge,
            item.status === "approved" && styles.statusApproved,
            item.status === "pending" && styles.statusPending,
            item.status === "blocked" && styles.statusBlocked,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "approved" && { color: colors.success },
              item.status === "pending" && { color: colors.warning },
              item.status === "blocked" && { color: colors.error },
            ]}
          >
            {item.status === "approved"
              ? "Approved"
              : item.status === "pending"
                ? "Pending"
                : "Blocked"}
          </Text>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveDriver(item)}
            >
              <Feather name="check" size={16} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectDriver(item)}
            >
              <Feather name="x" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {item.status !== "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleRejectDriver(item)}
            >
              <Feather name="trash-2" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
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
          onPress={() => router.push("/admin/settings")}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Drivers</Text>
        <TouchableOpacity style={styles.addButton}>
          <Feather name="user-plus" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDrivers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={colors.grayLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.grayLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "all" && styles.filterChipActive,
          ]}
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
            styles.filterChip,
            filter === "pending" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "pending" && styles.filterTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "approved" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("approved")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "approved" && styles.filterTextActive,
            ]}
          >
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "blocked" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("blocked")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "blocked" && styles.filterTextActive,
            ]}
          >
            Blocked
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDrivers}
        renderItem={renderDriverCard}
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
  addButton: { padding: 8 },
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
  driverCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 12,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  driverAvatar: { marginRight: 12 },
  driverAvatarBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: "600", color: colors.text },
  driverEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  driverDetails: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  driverActions: { alignItems: "flex-end", gap: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusApproved: { backgroundColor: colors.success + "20" },
  statusPending: { backgroundColor: colors.warning + "20" },
  statusBlocked: { backgroundColor: colors.error + "20" },
  statusText: { fontSize: 10, fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 8 },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  approveButton: { backgroundColor: colors.success },
  rejectButton: { backgroundColor: colors.error },
  deleteButton: { backgroundColor: colors.textSecondary },
});