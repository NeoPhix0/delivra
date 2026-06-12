import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

const COLORS = {
  blue: "#1665FF",
  blueDark: "#0A4FD4",
  orange: "#FF8A00",
  white: "#FFFFFF",
  text: "#101623",
  textMuted: "#9AA3B2",
  border: "#EDF0F7",
};

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 35,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── HERO IMAGE SECTION ── */}
      <View style={styles.heroSection}>
        {/* FULL BACKGROUND IMAGE */}
        <Animated.View style={[styles.illustrationBox, { opacity: fadeAnim }]}>
          <Image
            // ✅ غيّر هذا المسار حسب مكان صورتك
            source={require("../../assets/images/photo3.jpg")}
            style={styles.illustrationImage}
          />
        </Animated.View>

        {/* DARK OVERLAY for readability */}
        <View style={styles.overlay} />

        {/* BADGE on top of image */}
        <Animated.View style={[styles.badge, { opacity: fadeAnim }]}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Fast &amp; Reliable Delivery</Text>
        </Animated.View>

        {/* WAVE SVG on bottom of image */}
        <View style={styles.waveSvgWrapper}>
          <Svg width={width} height={70} viewBox={`0 0 ${width} 70`}>
            <Path
              d={`M0,30 Q${width * 0.25},0 ${width * 0.5},18 Q${
                width * 0.75
              },36 ${width},10 L${width},70 L0,70 Z`}
              fill="#FFFFFF"
            />
          </Svg>
        </View>
      </View>

      {/* ── WHITE BOTTOM SECTION ── */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: COLORS.blue }]}>50K+</Text>
            <Text style={styles.statLabel}>DELIVERIES</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: COLORS.orange }]}>4.9★</Text>
            <Text style={styles.statLabel}>RATING</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: COLORS.blue }]}>30min</Text>
            <Text style={styles.statLabel}>AVG TIME</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          Welcome to <Text style={{ color: COLORS.blue }}>Deli</Text>
          <Text style={{ color: COLORS.orange }}>vra</Text>
        </Text>

        <Text style={styles.subtitle}>
          Food, groceries, packages &amp; more{"\n"}delivered fast right to your
          door.
        </Text>

        {/* CHIPS */}
        <View style={styles.chipsRow}>
          {[
            {
              label: "Food",
              icon: "coffee",
              color: COLORS.blue,
              bg: "#EEF3FF",
            },
            {
              label: "Grocery",
              icon: "shopping-cart",
              color: COLORS.orange,
              bg: "#FFF5EB",
            },
            {
              label: "Packages",
              icon: "package",
              color: COLORS.blue,
              bg: "#EEF3FF",
            },
            {
              label: "Pharmacy",
              icon: "heart",
              color: COLORS.orange,
              bg: "#FFF5EB",
            },
          ].map((chip) => (
            <View
              key={chip.label}
              style={[styles.chip, { backgroundColor: chip.bg }]}
            >
              <Feather name={chip.icon as any} size={11} color={chip.color} />
              <Text style={[styles.chipText, { color: chip.color }]}>
                {chip.label}
              </Text>
            </View>
          ))}
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.btnLogin}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.btnLoginText}>Log In</Text>
        </TouchableOpacity>

        {/* REGISTER BUTTON */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.btnRegister}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.btnRegisterText}>Create an Account</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our{" "}
          <Text style={{ color: COLORS.blue, fontWeight: "600" }}>
            Terms &amp; Privacy Policy
          </Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  heroSection: {
    height: height * 0.48,
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.blue,
  },

  illustrationBox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  illustrationImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(22, 101, 255, 0.25)",
    zIndex: 2,
  },

  badge: {
    position: "absolute",
    top: 52,
    alignSelf: "center",
    zIndex: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.orange,
  },

  badgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  waveSvgWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },

  bottomSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 28,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
    marginBottom: 16,
  },

  stat: {
    alignItems: "center",
  },

  statNum: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  statSep: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chipText: {
    fontSize: 11,
    fontWeight: "700",
  },

  btnLogin: {
    height: 54,
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },

  btnLoginText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  btnRegister: {
    height: 54,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.orange,
    marginBottom: 14,
  },

  btnRegisterText: {
    color: COLORS.orange,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  terms: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
