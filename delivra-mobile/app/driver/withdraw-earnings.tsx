import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";

export default function WithdrawEarningsScreen() {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const balance = 156800;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // TODO: connect to API when endpoint is available
  const withdrawMethods = [
    { id: "bank", name: "Bank Transfer", icon: "🏦", min: 5000 },
    { id: "cib", name: "CIB", icon: "💳", min: 2000 },
    { id: "edahabia", name: "Edahabia", icon: "💎", min: 1000 },
  ];

  const handleWithdraw = () => {
    const withdrawAmount = parseInt(amount);
    const method = withdrawMethods.find((m) => m.id === selectedMethod);
    if (!amount) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }
    if (withdrawAmount < (method?.min || 0)) {
      Alert.alert(
        "Error",
        `Minimum withdrawal is ${method?.min.toLocaleString()} DA`,
      );
      return;
    }
    if (withdrawAmount > balance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }
    if (selectedMethod === "bank" && (!bankAccount || !bankName)) {
      Alert.alert("Error", "Please enter bank account details");
      return;
    }
    Alert.alert(
      "Confirm Withdrawal",
      `Withdraw ${withdrawAmount.toLocaleString()} DA via ${method?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert("Success", "Withdrawal request submitted!");
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Withdraw Earnings"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Balance Card */}
        <Animated.View style={[styles.balanceCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>
              {balance.toLocaleString()} DA
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Amount Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>💰 Withdrawal Amount</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount in DA"
            placeholderTextColor={colors.grayLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <View style={styles.quickAmounts}>
            <TouchableOpacity
              onPress={() => setAmount("5000")}
              style={styles.quickAmountBtn}
            >
              <Text style={styles.quickAmountText}>5,000 DA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAmount("10000")}
              style={styles.quickAmountBtn}
            >
              <Text style={styles.quickAmountText}>10,000 DA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAmount("25000")}
              style={styles.quickAmountBtn}
            >
              <Text style={styles.quickAmountText}>25,000 DA</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Method Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>🏦 Withdrawal Method</Text>
          {withdrawMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                selectedMethod === method.id && styles.methodActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View style={styles.methodInfo}>
                <Text
                  style={[
                    styles.methodName,
                    selectedMethod === method.id && { color: colors.primary },
                  ]}
                >
                  {method.name}
                </Text>
                <Text style={styles.methodMin}>
                  Min: {method.min.toLocaleString()} DA
                </Text>
              </View>
              {selectedMethod === method.id && (
                <Feather name="check" size={18} color={colors.success} />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Bank Details (if selected) */}
        {selectedMethod === "bank" && (
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Text style={styles.cardTitle}>🏦 Bank Account Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              placeholderTextColor={colors.grayLight}
              value={bankName}
              onChangeText={setBankName}
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Account Number"
              placeholderTextColor={colors.grayLight}
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="numeric"
            />
          </Animated.View>
        )}

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
          <LinearGradient
            colors={[colors.success, colors.success]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.withdrawGradient}
          >
            <Text style={styles.withdrawBtnText}>Withdraw →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Withdrawals are processed within 1-3 business days
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceGradient: {
    padding: 24,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white + "CC",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 16,
  },
  amountInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: colors.background,
    color: colors.black,
  },
  quickAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  quickAmountBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  methodActive: {
    backgroundColor: colors.primarySoft,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
  methodMin: {
    fontSize: 11,
    color: colors.grayLight,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: colors.background,
    color: colors.black,
  },
  withdrawBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 40,
    overflow: "hidden",
  },
  withdrawGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  infoText: {
    textAlign: "center",
    fontSize: 11,
    color: colors.grayLight,
    marginHorizontal: 20,
    marginBottom: 30,
  },
});
