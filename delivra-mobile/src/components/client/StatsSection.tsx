import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "@constants/colors";

export interface DashboardStats {
  label: string;
  value: string;
  color: string;
  icon: string;
  bg: string;
}

interface StatsSectionProps {
  stats: DashboardStats[];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>📊 Overview</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContent}
      >
        {stats.map((stat, index) => (
          <LinearGradient
            key={index}
            colors={[stat.bg, colors.white]}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: stat.color + "20" },
              ]}
            >
              <Feather
                name={stat.icon as any}
                size={22}
                color={stat.color}
              />
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  statsSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
  },
  statsContent: {
    paddingRight: 16,
    gap: 12,
  },
  statCard: {
    width: 110,
    borderRadius: 24,
    padding: 14,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray,
    textAlign: "center",
    marginTop: 4,
  },
});