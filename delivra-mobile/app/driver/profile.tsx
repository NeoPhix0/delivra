import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SharedHeader } from "@components/shared/SharedHeader";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { statsService, userService, driverService } from "@services/api";
import { useAuth } from "@context/AuthContext";

export default function DriverProfileScreen() {
  const { logout: authLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState([
    { label: "Rating", value: "0 ⭐", icon: "star", color: colors.warning, bg: colors.warning + "20" },
    { label: "Deliveries", value: "0", icon: "truck", color: colors.primary, bg: colors.primarySoft },
    { label: "Active", value: "0", icon: "zap", color: colors.secondary, bg: colors.secondarySoft },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [userRes, driverRes, statsRes] = await Promise.all([
        userService.getProfile().catch(() => null),
        driverService.getProfile().catch(() => null),
        statsService.getDriverStats().catch(() => null),
      ]);

      // Handle user profile data
      if (userRes) {
        setEmail(userRes.email || "");
      }

      // Handle driver profile data
      if (driverRes) {
        setProfileData(driverRes);
        setName(driverRes.name || userRes?.fullName || userRes?.full_name || "");
        setPhone(driverRes.phone || userRes?.phone || "");
        // After adaptKeys(), API fields become camelCase
        setVehicleType(driverRes.vehicleType || driverRes.vehicle_type || "");
        setVehiclePlate(driverRes.licenseNumber || driverRes.license_number || "");
        setExperienceYears(String(driverRes.experienceYears ?? driverRes.experience_years ?? ""));
      } else if (userRes) {
        setName(userRes.fullName || userRes.full_name || "");
        setPhone(userRes.phone || "");
      }

      // Handle stats — after adaptKeys(), fields are camelCase
      if (statsRes) {
        setStats([
          { label: "Rating", value: `${statsRes.averageRating || statsRes.average_rating || 0} ⭐`, icon: "star", color: colors.warning, bg: colors.warning + "20" },
          { label: "Deliveries", value: String(statsRes.completedDeliveries || statsRes.completed_deliveries || 0), icon: "truck", color: colors.primary, bg: colors.primarySoft },
          { label: "Active", value: String(statsRes.activeDeliveries || statsRes.active_deliveries || 0), icon: "zap", color: colors.secondary, bg: colors.secondarySoft },
        ]);
      }
    } catch (err: any) {
      console.error("Error loading driver profile:", err);
      setError(err.message || "Failed to load profile");
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
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update user fields (fullName, phone)
      const userUpdate: any = {};
      if (name.trim()) userUpdate.fullName = name.trim();
      if (phone.trim()) userUpdate.phone = phone.trim();

      if (Object.keys(userUpdate).length > 0) {
        await userService.updateProfile(userUpdate);
      }

      // Update driver-specific fields — send snake_case to API
      const driverUpdate: any = {};
      if (vehicleType.trim()) driverUpdate.vehicleType = vehicleType.trim();
      if (vehiclePlate.trim()) driverUpdate.licenseNumber = vehiclePlate.trim();
      if (experienceYears.trim()) driverUpdate.experienceYears = parseInt(experienceYears.trim(), 10) || 0;

      if (Object.keys(driverUpdate).length > 0) {
        await driverService.updateProfile(driverUpdate);
      }

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
      await loadProfile();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", err?.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: async () => {
        try {
          await authLogout();
        } catch (_e) {
          // Ignore errors during logout
        }
        router.replace("/(auth)/welcome");
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Driver Profile"
          showBackButton={true}
          onBackPress={() => router.push({ pathname: "/driver/settings" })}
          rightContent={
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <LinearGradient
                colors={isEditing ? [colors.grayLight, colors.grayLight] : [colors.secondary, colors.secondaryDark]}
                style={styles.editButton}
              >
                <Feather name={isEditing ? "x" : "edit-2"} size={14} color={colors.white} />
                <Text style={styles.editButtonText}>{isEditing ? "Cancel" : "Edit"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          }
        />

        {/* Avatar */}
        <Animated.View style={[styles.avatarContainer, { opacity: fadeAnim }]}>
          <LinearGradient colors={[colors.primarySoft, colors.white]} style={styles.avatarBorder}>
            <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
              {profileData?.avatar || profileData?.image ? (
                <Image source={{ uri: profileData.avatar || profileData.image }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }]}>
                  <Feather name="user" size={40} color={colors.white} />
                </View>
              )}
            </View>
          </LinearGradient>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Feather name="camera" size={16} color={colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.white }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Profile Info */}
        <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
          <InfoRow icon="user" label="Full Name" value={name} isEditing={isEditing} onChangeText={setName} />
          <InfoRow icon="mail" label="Email" value={email} isEditing={false} onChangeText={() => {}} keyboardType="email-address" />
          <InfoRow icon="phone" label="Phone" value={phone} isEditing={isEditing} onChangeText={setPhone} keyboardType="phone-pad" />
          <InfoRow icon="truck" label="Vehicle Type" value={vehicleType} isEditing={isEditing} onChangeText={setVehicleType} />
          <InfoRow icon="hash" label="License Number" value={vehiclePlate} isEditing={isEditing} onChangeText={setVehiclePlate} />
          <InfoRow icon="briefcase" label="Experience" value={experienceYears ? `${experienceYears} years` : ""} isEditing={isEditing} onChangeText={setExperienceYears} keyboardType="numeric" />
          <InfoRow icon="globe" label="Languages" value={(profileData?.languages || []).join(", ") || ""} isEditing={false} onChangeText={() => {}} last />

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              <LinearGradient colors={[colors.success, colors.success]} style={styles.saveButtonGradient}>
                {saving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Feather name="check" size={18} color={colors.white} />
                )}
                <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
  isEditing,
  onChangeText,
  keyboardType,
  last,
}: any) => (
  <View style={[styles.infoRow, !last && { borderBottomColor: colors.graySoft }]}>
    <View style={[styles.infoIcon, { backgroundColor: colors.primarySoft }]}>
      <Feather name={icon} size={18} color={colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={colors.grayLight}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "—"}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  editButtonText: { color: colors.white, fontSize: 12, fontWeight: "500" },
  avatarContainer: { alignItems: "center", marginVertical: 16 },
  avatarBorder: { padding: 4, borderRadius: 60 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 50 },
  avatarText: { fontSize: 48 },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  changePhotoText: { fontSize: 12, color: colors.primary },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
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
  statValue: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  statLabel: { fontSize: 10, color: colors.textSecondary },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "500", color: colors.text },
  infoInput: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingVertical: 2,
  },
  saveButton: { marginTop: 16, borderRadius: 40, overflow: "hidden" },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: "bold" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error + "20",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 40,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: 30,
  },
  logoutButtonText: { color: colors.error, fontSize: 16, fontWeight: "500" },
  bottomPadding: { height: 20 },
});