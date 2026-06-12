import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

interface SectionHeaderProps {
  title: string;
  icon?: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  onSeeAll,
  showSeeAll = false,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{icon ? `${icon} ${title}` : title}</Text>
      </View>
      {showSeeAll && onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.link}>See All →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
  },
  link: {
    color: colors.secondary,
    fontWeight: "600",
    fontSize: 13,
  },
});