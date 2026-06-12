import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@context/AuthContext";
import colors from "@constants/colors";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const moveAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(moveAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, moveAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // The layout will redirect based on user role
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Error", error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: moveAnim }],
            }}
          >
            {/* BACK BUTTON */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace("/(auth)/welcome")}
            >
              <Feather name="arrow-left" size={18} color={colors.text} />
            </TouchableOpacity>

            {/* LOGO + APP NAME */}
            <View style={styles.logoSection}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.pageTitle}>Sign in to your account</Text>
              <Text style={styles.pageSubtitle}>
                Welcome back! Select method to log in
              </Text>
            </View>

            {/* EMAIL INPUT */}
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={colors.orange} />
              <TextInput
                placeholder="Enter Your Email"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={colors.orange} />
              <TextInput
                placeholder="Enter Your Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* REMEMBER + FORGOT */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRemember(!remember)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radioOuter,
                    remember && styles.radioOuterActive,
                  ]}
                >
                  {remember && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>Forget Password?</Text>
              </TouchableOpacity>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.btnMain}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnMainText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or Continue With</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* SOCIAL BUTTONS */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Text style={styles.googleLetter}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Feather name="smartphone" size={20} color={colors.text} />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* SIGN UP LINK */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don&apos;t have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.signupLink}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 38,
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    height: 58,
    gap: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: colors.orange,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orange,
  },
  rememberText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.orange,
  },
  btnMain: {
    height: 58,
    backgroundColor: colors.orange,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  btnMainText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.inputBorder,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 38,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  googleLetter: {
    fontSize: 20,
    fontWeight: "900",
    color: "#EA4335",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.blue,
  },
});