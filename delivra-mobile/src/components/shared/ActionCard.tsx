import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

interface ActionCardProps {
  icon: string;
  iconFamily?: "Ionicons" | "Feather";
  label: string;
  onPress: () => void;
  color?: string;
  bg?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  onPress,
  color = colors.primary,
  bg = colors.primarySoft,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.85}>
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});