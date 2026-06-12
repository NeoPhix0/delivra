import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "@constants/colors";
import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { LogoutButton } from "@components/shared/LogoutButton";

interface RoleSettingsProps {
  role: "client" | "driver" | "admin";
}

export default function RoleSettings({ role }: RoleSettingsProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const isDark = theme === "dark";

  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [language, setLanguage] = useState("English");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim1, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orbAnim1, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim2, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(orbAnim2, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orbTranslateY1 = orbAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const orbTranslateY2 = orbAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  const handleLanguageChange = () => Alert.alert("Language", "Coming soon!");

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headerWrapper, { transform: [{ translateY: headerSlide }] }]}>
          <LinearGradient
            colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Animated.View style={[styles.decorOrb, styles.decorOrb1, { transform: [{ translateY: orbTranslateY1 }] }]} />
            <Animated.View style={[styles.decorOrb, styles.decorOrb2, { transform: [{ translateY: orbTranslateY2 }] }]} />
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <View style={styles.backButtonInner}>
                  <Feather name="arrow-left" size={22} color={colors.white} />
                </View>
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Customize your experience</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Section Compte — liens par rôle */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            {role === "admin" && (
              <>
                <SettingItem icon="person-outline" label="Profile" onPress={() => router.push({ pathname: "/admin/profile" })} type="link" />
                <SettingItem icon="people-outline" label="Manage Users" onPress={() => router.push({ pathname: "/admin/users" })} type="link" />
                <SettingItem icon="car-outline" label="Manage Drivers" onPress={() => router.push({ pathname: "/admin/drivers" })} type="link" last />
              </>
            )}
            {role === "driver" && (
              <SettingItem icon="person-outline" label="Profile" onPress={() => router.push({ pathname: "/driver/profile" })} type="link" last />
            )}
            {role === "client" && (
              <SettingItem icon="person-outline" label="Profile" onPress={() => router.push({ pathname: "/client/profile" })} type="link" last />
            )}
          </View>
        </Animated.View>

        {/* Section Preferences */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <SettingItem icon="notifications-outline" label="Push Notifications" value={notifications} onValueChange={setNotifications} type="switch" />
            <SettingItem icon="volume-high-outline" label="Sound" value={sound} onValueChange={setSound} type="switch" />
            <SettingItem icon="vibrate-outline" label="Vibration" value={vibration} onValueChange={setVibration} type="switch" />
            <SettingItem icon="moon-outline" label="Dark Mode" value={isDark} onValueChange={toggleTheme} type="switch" />
            <SettingItem icon="language-outline" label="Language" value={language} onPress={handleLanguageChange} type="select" last />
          </View>
        </Animated.View>

        {/* Bouton Logout */}
        <LogoutButton onPress={handleLogout} />

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const SettingItem = ({ icon, label, value, onValueChange, onPress, type, danger, last }: any) => {
  const content = (
    <>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary} />
        </View>
        <Text style={[styles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      </View>
      {type === "switch" ? (
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.graySoft, true: colors.secondary }} thumbColor={colors.white} />
      ) : type === "select" ? (
        <View style={styles.selectContainer}>
          <Text style={styles.selectValue}>{value}</Text>
          <Feather name="chevron-right" size={18} color={colors.gray} />
        </View>
      ) : (
        <Feather name="chevron-right" size={18} color={colors.gray} />
      )}
    </>
  );

  if (type === "link") {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.settingItem, last && styles.lastItem]} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.settingItem, last && styles.lastItem]}>{content}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrapper: { marginBottom: 0 },
  headerGradient: { paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: "hidden", position: "relative" },
  decorOrb: { position: "absolute", borderRadius: 999, opacity: 0.12 },
  decorOrb1: { width: 120, height: 120, backgroundColor: colors.secondary, top: -30, right: -20 },
  decorOrb2: { width: 80, height: 80, backgroundColor: colors.white, bottom: 10, left: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 48, paddingBottom: 10 },
  backButton: { padding: 4 },
  backButtonInner: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white + "33", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.white + "4D" },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: colors.white, letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, color: colors.white + "B3", marginTop: 2 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: colors.gray, marginHorizontal: 16, marginBottom: 8 },
  sectionCard: { marginHorizontal: 16, borderRadius: 20, overflow: "hidden", shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  settingItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.graySoft },
  lastItem: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  settingLabel: { fontSize: 14, color: colors.black },
  selectContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  selectValue: { fontSize: 13, color: colors.gray },
  logoutButton: { marginHorizontal: 16, marginTop: 24, marginBottom: 16, borderRadius: 40, overflow: "hidden", shadowColor: colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  logoutGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8 },
  logoutText: { color: colors.white, fontSize: 16, fontWeight: "bold" },
  versionText: { textAlign: "center", fontSize: 12, color: colors.grayLight, marginBottom: 30 },
});