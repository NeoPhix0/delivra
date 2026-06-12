import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "@context/AuthContext";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "@constants/colors";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"client" | "driver">("client");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("");
    
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMessage("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({ 
        full_name: fullName.trim(), 
        email: email.trim().toLowerCase(), 
        phone: phone.trim(),
        password, 
        role 
      });
      // The layout will redirect based on user role
    } catch (error: any) {
      setLoading(false);
      let message = "Registration failed. Please try again.";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.request) {
        message = "Network error. Please check your connection.";
      } else if (error.message) {
        message = error.message;
      }
      setErrorMessage(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/welcome')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Delivra today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+213 6XX XXX XXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              placeholderTextColor={colors.gray}
            />
          </View>

          <Text style={styles.label}>I am a</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "client" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("client")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "client" && styles.roleTextActive,
                ]}
              >
                Client
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "driver" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("driver")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "driver" && styles.roleTextActive,
                ]}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ color: '#DC2626', fontSize: 13, textAlign: 'center' }}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Register →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  backButton: { marginBottom: 20 },
  backButtonText: { fontSize: 16, color: colors.primary, fontWeight: "500" },
  title: { fontSize: 32, fontWeight: "bold", color: colors.primary },
  subtitle: { fontSize: 14, color: colors.gray, marginTop: 8 },
  form: { paddingHorizontal: 24, paddingBottom: 40 },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  roleContainer: { flexDirection: "row", gap: 12, marginBottom: 30 },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: { fontSize: 14, color: colors.gray },
  roleTextActive: { color: colors.white, fontWeight: "600" },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: { color: colors.white, fontSize: 16, fontWeight: "bold" },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: { color: colors.gray },
  loginLink: { color: colors.primary, fontWeight: "600" },
});
