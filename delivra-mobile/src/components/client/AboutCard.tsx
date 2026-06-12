import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

export const AboutCard: React.FC = () => {
  return (
    <View style={styles.aboutCard}>
      <LinearGradient colors={[colors.white, colors.background]} style={styles.aboutCardGradient}>
        <View style={styles.aboutLeft}>
          <Text style={styles.aboutTitle}>🚀 Who Are We?</Text>
          <Text style={styles.aboutText}>
            We provide fast, secure and reliable delivery services for food, documents, clothes and more with real-time tracking.
          </Text>
          <TouchableOpacity style={styles.learnMoreBtn} activeOpacity={0.8}>
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=800&auto=format&fit=crop" }}
          style={styles.aboutImage}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  aboutCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  aboutCardGradient: { flexDirection: "row", alignItems: "center", padding: 20 },
  aboutLeft: { flex: 1, paddingRight: 12 },
  aboutTitle: { fontSize: 18, fontWeight: "bold", color: colors.black, marginBottom: 8 },
  aboutText: { fontSize: 12, lineHeight: 18, color: colors.gray },
  learnMoreBtn: { backgroundColor: colors.secondarySoft, alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  learnMoreText: { color: colors.secondary, fontWeight: "500", fontSize: 12 },
  aboutImage: { width: 100, height: 100, borderRadius: 20 },
});