import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { deliveryService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DriverData {
  id: string;
  name?: string;
  phone?: string;
  rating?: number;
  totalDeliveries?: number;
  total_deliveries?: number;
  profilePicture?: string;
  profile_picture?: string;
  experienceYears?: number;
  experience_years?: number;
  languages?: string;
  isOnline?: boolean;
  is_online?: boolean;
  vehicleType?: string;
  vehicle_type?: string;
  licensePlate?: string;
  license_plate?: string;
  vehicle?: {
    type?: string;
    plate?: string;
  };
}

export default function DriverProfileScreen() {
  const params = useLocalSearchParams();
  const driverId = (params.id as string) || "";
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDriver = useCallback(async () => {
    if (!driverId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryService.getDriverById(driverId);
      const data = response;
      setDriver(data);
    } catch (err: any) {
      console.error("Load driver profile error:", err);
      setError(err.message || "Failed to load driver profile");
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadDriver();
  }, [loadDriver]);

  const handleCall = () => {
    if (driver?.phone) {
      Alert.alert("Call Driver", `Calling ${driver.name} at ${driver.phone}`);
    }
  };

  const handleMessage = () => {
    Alert.alert("Message", `Send a message to ${driver?.name || "driver"}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <SharedHeader
          title="Driver Profile"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading driver profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <SharedHeader
          title="Driver Profile"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDriver}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Driver Profile"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Driver Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {driver?.profile_picture ? (
              <Image source={{ uri: driver.profile_picture }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <Feather name="user" size={40} color={colors.grayLight} />
              </View>
            )}
          </View>
          <Text style={styles.driverName}>{driver?.name || "—"}</Text>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingText}>{driver?.rating?.toFixed(1) || "—"}</Text>
            <Text style={styles.reviewLink}>
              ({driver?.total_deliveries || 0} deliveries)
            </Text>
          </View>
          <View style={styles.onlineContainer}>
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: driver?.is_online ? colors.success : colors.grayLight },
              ]}
            />
            <Text style={styles.onlineText}>
              {driver?.is_online ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={handleCall}
          >
            <Feather name="phone" size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.messageBtn]}
            onPress={handleMessage}
          >
            <Feather name="message-circle" size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📋 Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="user" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{driver?.name || "—"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="phone" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{driver?.phone || "—"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        {(driver?.vehicleType || driver?.vehicle_type || driver?.vehicle) && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>🚗 Vehicle Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Feather name="truck" size={18} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Vehicle Type</Text>
                <Text style={styles.infoValue}>{driver.vehicleType || driver.vehicle_type || driver.vehicle?.type || "—"}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Feather name="hash" size={18} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>License Plate</Text>
                <Text style={styles.infoValue}>{driver.licensePlate || driver.license_plate || driver.vehicle?.plate || "—"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Statistics */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.primarySoft, colors.white]}
                style={styles.statCardGradient}
              >
                <Feather name="truck" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{driver?.total_deliveries || 0}</Text>
                <Text style={styles.statLabel}>Deliveries</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.secondarySoft, colors.white]}
                style={styles.statCardGradient}
              >
                <Feather name="star" size={24} color={colors.secondary} />
                <Text style={styles.statValue}>{driver?.rating?.toFixed(1) || "—"}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.success + "15", colors.white]}
                style={styles.statCardGradient}
              >
                <Feather name="award" size={24} color={colors.success} />
              <Text style={styles.statValue}>{driver?.experienceYears || driver?.experience_years || 0}y</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Languages */}
        {driver?.languages && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>🌐 Languages</Text>
            <View style={styles.infoCard}>
              <View style={styles.zoneContainer}>
                <Feather name="globe" size={18} color={colors.primary} />
                <Text style={styles.zoneText}>{driver.languages}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grayLight,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: -30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.white,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.graySoft,
  },
  driverName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.warning,
  },
  reviewLink: {
    fontSize: 13,
    color: colors.gray,
  },
  onlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 13,
    color: colors.gray,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  callBtn: {
    backgroundColor: colors.success,
  },
  messageBtn: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: colors.graySoft,
    marginVertical: 14,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  statCardGradient: {
    alignItems: "center",
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 4,
  },
  zoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  zoneText: {
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  bottomPadding: {
    height: 30,
  },
});