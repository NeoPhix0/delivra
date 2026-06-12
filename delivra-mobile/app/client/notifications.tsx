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
import { SharedHeader } from "@components/shared/SharedHeader";
import { useFocusEffect } from "expo-router";

interface ClientNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      loadUnreadCount();
    }, [])
  );

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

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      const items = Array.isArray(data) ? data : (data?.notifications || []);
      const transformed: ClientNotification[] = items.map((n: any, index: number) => ({
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
  };

  const loadUnreadCount = async () => {
    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCount(result?.count ?? result?.unreadCount ?? result ?? 0);
    } catch (err: any) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  };

  const renderNotification = ({ item }: ListRenderItemInfo<ClientNotification>) => (
    <TouchableOpacity onPress={() => !item.read && handleMarkAsRead(item.id)} activeOpacity={0.7}>
      <Animated.View style={[styles.notificationCard, { opacity: fadeAnim }]}>
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
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
        title="Notifications"
        subtitle="Stay updated"
        showBackButton={true}
        onBackPress={() => router.back()}
          rightContent={
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
              <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text style={styles.markAllText}>Mark all</Text>
              </TouchableOpacity>
            </View>
          }
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 12,
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  markAllText: {
    fontSize: 12,
    color: colors.white + "CC",
    fontWeight: "500",
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
    color: colors.gray,
    marginBottom: 4,
  },

  unreadTitle: {
    color: colors.primary,
  },

  message: {
    fontSize: 12,
    color: colors.gray,
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
