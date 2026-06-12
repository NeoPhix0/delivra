import React from "react";
import { StyleSheet, Text } from "react-native";
import colors from "@constants/colors";

interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.warning, text: colors.white, label: "Pending" },
  in_progress: { bg: colors.secondary, text: colors.white, label: "In Progress" },
  in_transit: { bg: colors.secondary, text: colors.white, label: "In Transit" },
  active: { bg: colors.secondary, text: colors.white, label: "Active" },
  accepted: { bg: colors.secondary, text: colors.white, label: "Accepted" },
  completed: { bg: colors.success, text: colors.white, label: "Completed" },
  delivered: { bg: colors.success, text: colors.white, label: "Delivered" },
  cancelled: { bg: colors.error, text: colors.white, label: "Cancelled" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_MAP[status?.toLowerCase()] || {
    bg: colors.graySoft,
    text: colors.textSecondary,
    label: status,
  };

  return (
    <Text style={[styles.badge, { backgroundColor: config.bg, color: config.text }]}>
      {config.label}
    </Text>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "600",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
});