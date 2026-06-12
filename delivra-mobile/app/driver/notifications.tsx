import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { SharedHeader } from "@components/shared/SharedHeader";
import { notificationService } from "@services/api";

interface DriverNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

export default function NotificationsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      const items = Array.isArray(data) ? data : (data?.notifications || []);
      
      // Transform API data to match DriverNotification interface
      const transformed: DriverNotification[] = items.map((n: any, index: number) => ({
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
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const renderNotification = ({ item }: ListRenderItemInfo<DriverNotification>) => (
    <Animated.View
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard,
        { opacity: fadeAnim },
      ]}
    >
      <LinearGradient
        colors={[item.color + "15", colors.white]}
        style={styles.iconContainer}
      >
        <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} size={22} color={item.color} />
      </LinearGradient>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {!item.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
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

      <SharedHeader
        title="Notifications"
        showBackButton={true}
        onBackPress={() => router.push("/driver/settings")}
        rightContent={
          <TouchableOpacity>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
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
          initialNumToRender={5}
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
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12, // ✅ Added space between header and first card
    paddingBottom: 30,
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
    color: colors.grayLight,
    marginBottom: 4,
  },
  unreadTitle: {
    color: colors.primary,
  },
  message: {
    fontSize: 12,
    color: colors.grayLight,
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
  markAllText: {
    fontSize: 12,
    color: colors.white + "CC",
  },
});
