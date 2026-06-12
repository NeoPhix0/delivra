import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

interface QuickActionsProps {
  /** Handler appelé avec le nom de l'action ("track" | "history") */
  onActionPress: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionPress }) => {
  return (
    <View style={styles.quickSection}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => {
            onActionPress("track");
            router.push({ pathname: "/client/order-tracking" });
          }}
        >
          <LinearGradient colors={[colors.primarySoft, colors.white]} style={styles.quickIconBg}>
            <Feather name="map-pin" size={24} color={colors.secondary} />
          </LinearGradient>
          <Text style={styles.quickText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => {
            onActionPress("history");
            router.push({ pathname: "/client/my-orders" });
          }}
        >
          <LinearGradient colors={[colors.secondarySoft, colors.white]} style={styles.quickIconBg}>
            <Feather name="clock" size={24} color={colors.primary} />
          </LinearGradient>
          <Text style={styles.quickText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.black },
  quickGrid: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  quickCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  quickIconBg: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  quickText: { marginTop: 8, fontSize: 13, fontWeight: "600", color: colors.black },
});