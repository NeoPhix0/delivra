import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

export interface SharedHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
  showAvatar?: boolean;
  avatarUrl?: string;
  userName?: string;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export const SharedHeader: React.FC<SharedHeaderProps> = ({
  title = "Dashboard",
  subtitle,
  showBackButton = false,
  onBackPress,
  rightContent,
  showAvatar = false,
  avatarUrl = "https://i.pravatar.cc/300",
  userName,
  onNotificationPress,
  notificationCount,
}) => {
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerSlide, {
      toValue: 0,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();

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

  const orbTranslateY1 = orbAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });
  const orbTranslateY2 = orbAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <Animated.View
      style={[styles.headerWrapper, { transform: [{ translateY: headerSlide }] }]}
    >
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Decorative Orbs */}
        <Animated.View
          style={[
            styles.decorOrb,
            styles.decorOrb1,
            { transform: [{ translateY: orbTranslateY1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.decorOrb,
            styles.decorOrb2,
            { transform: [{ translateY: orbTranslateY2 }] },
          ]}
        />

        <View style={styles.header}>
          {/* Left : back button or placeholder */}
          {showBackButton ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <Feather name="arrow-left" size={22} color={colors.white} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 52 }} />
          )}

          {/* Center : title + subtitle */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? (
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            ) : null}
          </View>

          {/* Right : rightContent or notification or placeholder */}
          {rightContent ? (
            rightContent
          ) : onNotificationPress ? (
            <TouchableOpacity onPress={onNotificationPress} style={styles.iconBtn}>
              {notificationCount != null && notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
              <Feather name="bell" size={20} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 52 }} />
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: { marginBottom: 0 },
  headerGradient: {
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  decorOrb: { position: "absolute", borderRadius: 999, opacity: 0.12 },
  decorOrb1: {
    width: 120,
    height: 120,
    backgroundColor: colors.secondary,
    top: -30,
    right: -20,
  },
  decorOrb2: {
    width: 80,
    height: 80,
    backgroundColor: colors.white,
    bottom: 10,
    left: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 10,
  },
  backButton: { padding: 4 },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white + "33",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.white + "4D",
  },
  headerCenter: { alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.white + "B3",
    marginTop: 2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white + "33",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  badgeText: { color: colors.white, fontSize: 8, fontWeight: "bold" },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.white + "4D",
  },
  profileImage: { width: "100%", height: "100%" },
});