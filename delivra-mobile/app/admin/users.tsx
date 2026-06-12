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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: string;
  orders: number;
}

export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers();
      const items = Array.isArray(data) ? data : (data?.users || []);
      const transformed: User[] = items.map((u: any, index: number) => ({
        id: u.id || String(index),
        name: u.name || u.full_name || 'Unknown',
        email: u.email || '',
        phone: u.phone || '',
        date: u.date || (u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : ''),
        status: u.status || 'active',
        orders: u.orders || u.order_count || 0,
      }));
      setUsers(transformed);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
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
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBlockUser = async (user: User) => {
    const isBlocked = user.status === "blocked";
    Alert.alert(
      isBlocked ? "Unblock User" : "Block User",
      `Are you sure you want to ${isBlocked ? "unblock" : "block"} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setBlockingId(user.id);
              if (isBlocked) {
                await adminService.unblockUser(user.id);
              } else {
                await adminService.blockUser(user.id);
              }
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === user.id
                    ? { ...u, status: isBlocked ? "active" : "blocked" }
                    : u,
                ),
              );
              Alert.alert("Success", `User ${isBlocked ? "unblocked" : "blocked"} successfully`);
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || `Failed to ${isBlocked ? "unblock" : "block"} user`);
            } finally {
              setBlockingId(null);
            }
          },
        },
      ],
    );
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(user.id);
              await adminService.deleteUser(user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              Alert.alert("Success", "User deleted successfully");
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || "Failed to delete user");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const renderUserCard = ({ item }: ListRenderItemInfo<User>) => (
    <Animated.View style={[styles.userCard, { opacity: fadeAnim }]}>
      <View style={styles.userAvatar}>
        <View style={[styles.userAvatarBg, { backgroundColor: colors.primarySoft }]}>
          <Feather name="user" size={24} color={colors.primary} />
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        <Text style={styles.userDate}>Joined: {item.date}</Text>
      </View>
      <View style={styles.userActions}>
        <View
          style={[
            styles.statusBadge,
            item.status === "active"
              ? styles.statusActive
              : styles.statusBlocked,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "active"
                ? { color: colors.success }
                : { color: colors.error },
            ]}
          >
            {item.status === "active" ? "Active" : "Blocked"}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              item.status === "active"
                ? styles.blockButton
                : styles.unblockButton,
            ]}
            onPress={() => handleBlockUser(item)}
          >
            <Feather
              name={item.status === "active" ? "slash" : "check-circle"}
              size={16}
              color={colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item)}
          >
            <Feather name="trash-2" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity style={styles.addButton}>
          <Feather name="user-plus" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
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

      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
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
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  userCard: {
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
  userAvatar: { marginRight: 12 },
  userAvatarBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "600", color: colors.text },
  userEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  userPhone: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  userDate: { fontSize: 10, color: colors.grayLight, marginTop: 2 },
  userActions: { alignItems: "flex-end", gap: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusActive: { backgroundColor: colors.success + "20" },
  statusBlocked: { backgroundColor: colors.error + "20" },
  statusText: { fontSize: 10, fontWeight: "500" },
  actionButtons: { flexDirection: "row", gap: 8 },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  blockButton: { backgroundColor: colors.error },
  unblockButton: { backgroundColor: colors.success },
  deleteButton: { backgroundColor: colors.textSecondary },
});
