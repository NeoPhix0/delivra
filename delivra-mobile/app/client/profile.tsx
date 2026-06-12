import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { SharedHeader } from "@components/shared/SharedHeader";
import { statsService, userService } from "@services/api";


export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  const [stats, setStats] = useState([
    { label: "Total Orders", value: "0", icon: "package", color: colors.secondary },
    { label: "Completed", value: "0", icon: "check-circle", color: colors.success },
    { label: "Cancelled", value: "0", icon: "x-circle", color: colors.error },
  ]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, statsRes] = await Promise.all([
        userService.getProfile().catch(() => null),
        statsService.getUserStats().catch(() => null),
      ]);

      // Handle profile
      if (profileRes) {
        setProfileData(profileRes);
        setName(profileRes.fullName || profileRes.full_name || "");
        setEmail(profileRes.email || "");
        setPhone(profileRes.phone || "");
      }

      // Handle stats
      if (statsRes) {
        const stats = statsRes;
        setStats([
          { label: "Total Orders", value: String(stats.total_orders || 0), icon: "package", color: colors.secondary },
          { label: "Completed", value: String(stats.completed_orders || 0), icon: "check-circle", color: colors.success },
          { label: "Cancelled", value: String(stats.cancelled_orders || 0), icon: "x-circle", color: colors.error },
        ]);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

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

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: any = {};
      if (name.trim()) updateData.fullName = name.trim();
      if (phone.trim()) updateData.phone = phone.trim();

      const updated = await userService.updateProfile(updateData);
      if (updated) {
        setProfileData(updated);
        setName(updated.fullName || updated.full_name || name);
        setPhone(updated.phone || phone);
      }
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", err?.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="My Profile"
          subtitle="Manage your account"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightContent={
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <LinearGradient
                colors={
                  isEditing
                    ? [colors.gray, colors.gray]
                    : [colors.secondary, colors.secondaryDark]
                }
                style={styles.editButton}
              >
                <Feather
                  name={isEditing ? "x" : "edit-2"}
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.editButtonText}>
                  {isEditing ? "Cancel" : "Edit"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          }
        />

        {/* Avatar */}
        <Animated.View style={[styles.avatarContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[colors.primarySoft, colors.white]}
            style={styles.avatarBorder}
          >
            <View style={styles.avatar}>
              {profileData?.avatar ? (
                <Image source={{ uri: profileData.avatar }} style={styles.avatarImage} />
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
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: colors.white }]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stat.color + "15" },
                ]}
              >
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Profile Info */}
        <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text style={styles.infoValue}>{name}</Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{email}</Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{phone}</Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{profileData?.role || "—"}</Text>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={[colors.success, colors.success + "CC"]}
                style={styles.saveButtonGradient}
              >
                <Feather name="check" size={18} color={colors.white} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },

  editButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },

  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },

  avatarBorder: {
    padding: 4,
    borderRadius: 60,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },

  changePhotoText: {
    fontSize: 12,
    color: colors.primary,
  },

  // ================= STATS =================
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

  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    color: colors.gray,
  },

  // ================= PROFILE INFO =================
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
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    color: colors.black,
    fontWeight: "500",
  },

  infoInput: {
    fontSize: 16,
    color: colors.black,
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
  },

  divider: {
    height: 1,
    backgroundColor: colors.graySoft,
    marginVertical: 12,
  },

  saveButton: {
    marginTop: 16,
    borderRadius: 30,
    overflow: "hidden",
  },

  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});
