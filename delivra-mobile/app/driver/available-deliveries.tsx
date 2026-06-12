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
  TouchableOpacity,
  View,
} from "react-native";
import { driverService } from "@services/api";

interface AvailableDelivery {
  id: string;
  category_name?: string;
  estimated_price?: string | number;
  total_price?: string | number;
  pickup_address?: string;
  delivery_address?: string;
  distance_km?: number;
}

export default function AvailableDeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadAvailableDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getAvailableDeliveries();
      setDeliveries(Array.isArray(data) ? data : (data?.deliveries || []));
    } catch (err: any) {
      console.error("Load available deliveries error:", err);
      setError(err.message || 'Failed to load available deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableDeliveries();
  }, [loadAvailableDeliveries]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      setAccepting(deliveryId);
      await driverService.acceptDelivery(deliveryId);
      Alert.alert("Success", "Delivery accepted successfully!");
      
      // Navigate to active delivery screen
      router.replace({
        pathname: "/driver/active-delivery",
        params: { id: deliveryId }
      });
    } catch (error: any) {
      console.error("Accept delivery error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept delivery"
      );
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectDelivery = async (deliveryId: string) => {
    try {
      setRejecting(deliveryId);
      await driverService.rejectDelivery(deliveryId);
      Alert.alert("Success", "Delivery rejected successfully!");
      
      // Remove from list
      setDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    } catch (error: any) {
      console.error("Reject delivery error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reject delivery"
      );
    } finally {
      setRejecting(null);
    }
  };

  const renderDeliveryCard = ({ item }: ListRenderItemInfo<AvailableDelivery>) => (
    <Animated.View style={[styles.deliveryCard, { opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryName}>{item.category_name || "General"}</Text>
        <Text style={styles.estimatedPrice}>
          {item.estimated_price || item.total_price || 0} DA
        </Text>
      </View>
      
      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Feather name="map-pin" size={16} color={colors.primary} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationText}>{item.pickup_address}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.locationRow}>
          <View style={[styles.locationIcon, { backgroundColor: colors.warning + "20" }]}>
            <Feather name="home" size={16} color={colors.secondary} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Delivery</Text>
            <Text style={styles.locationText}>{item.delivery_address}</Text>
          </View>
        </View>
      </View>

      {item.distance_km && (
        <View style={styles.infoRow}>
          <Feather name="navigation" size={14} color={colors.grayLight} />
          <Text style={styles.infoText}>{item.distance_km} km</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.acceptButton, accepting === item.id && styles.acceptButtonDisabled]}
        onPress={() => handleAcceptDelivery(item.id)}
        disabled={accepting === item.id || rejecting === item.id}
      >
        {accepting === item.id ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.acceptButtonText}>Accept Delivery</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.rejectButton, rejecting === item.id && styles.rejectButtonDisabled]}
        onPress={() => handleRejectDelivery(item.id)}
        disabled={accepting === item.id || rejecting === item.id}
      >
        {rejecting === item.id ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.rejectButtonText}>Reject</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading available deliveries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Deliveries</Text>
        <TouchableOpacity onPress={loadAvailableDeliveries} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAvailableDeliveries}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {deliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color={colors.grayLight} />
          <Text style={styles.emptyText}>No available deliveries</Text>
          <Text style={styles.emptySubtext}>Pull to refresh to check for new deliveries</Text>
        </View>
      ) : (
        <FlatList
          data={deliveries}
          renderItem={renderDeliveryCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadAvailableDeliveries}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grayLight,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  backButton: { padding: 8 },
  refreshButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.white },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.grayLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.grayLight,
    marginTop: 8,
    textAlign: "center",
  },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  estimatedPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.grayLight,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  acceptButton: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  acceptButtonDisabled: {
    backgroundColor: colors.grayLight,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  rejectButtonDisabled: {
    backgroundColor: colors.grayLight,
  },
  rejectButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
