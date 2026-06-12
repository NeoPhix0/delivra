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
import { notificationService } from "@services/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

export default function AdminNotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      const items = Array.isArray(data) ? data : (data?.notifications || []);
      const transformed: Notification[] = items.map((n: any, index: number) => ({
        id: String(n.id || index),
        title: n.title || 'Notification',
        message: n.message || '',
        time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
        read: n.isRead || false,
        icon: n.type === 'DELIVERY' ? 'truck' : 'bell',
        color: n.type === 'DELIVERY' ? colors.primary : colors.secondary,
      }));
      setNotifications(transformed);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Failed to load notifications');
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
    loadNotifications();
  }, []);

  const renderNotification = ({ item }: ListRenderItemInfo<Notification>) => (
    <Animated.View
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard,
        { opacity: fadeAnim },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}
      >
        <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} size={22} color={item.color} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {!item.read && (
        <View style={[styles.unreadDot, { backgroundColor: item.color }]} />
      )}
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllText}>Mark all</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell-off" size={48} color={colors.grayLight} />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  markAllText: {
    fontSize: 12,
    color: colors.white + "CC",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.grayLight,
    marginTop: 16,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  unreadCard: {
    backgroundColor: colors.primarySoft,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  unreadTitle: {
    color: colors.primary,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  time: {
    fontSize: 10,
    color: colors.grayLight,
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});