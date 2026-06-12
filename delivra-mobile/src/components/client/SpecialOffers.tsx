import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

export interface Offer {
  title: string;
  subtitle: string;
  buttonLabel: string;
  gradientColors: [string, string];
  imageUrl: string;
}

interface SpecialOffersProps {
  offers: Offer[];
}

export const SpecialOffers: React.FC<SpecialOffersProps> = ({ offers }) => {
  if (offers.length === 0) return null;

  const offer = offers[0]; // on n'affiche qu'une offre pour le moment

  return (
    <View style={styles.offerSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>🔥 Special Offers</Text>
          <Text style={styles.sectionSubtitle}>Limited time deals</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/offers" })}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>
      <LinearGradient
        colors={offer.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.offerCard}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.offerTitle}>{offer.title}</Text>
          <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => router.push({ pathname: "/client/create-delivery/step1-category" })}
          >
            <Text style={styles.offerButtonText}>{offer.buttonLabel}</Text>
          </TouchableOpacity>
        </View>
        <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  offerSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.black },
  sectionSubtitle: { fontSize: 12, color: colors.gray, marginTop: 2 },
  seeAll: { color: colors.secondary, fontWeight: "600", fontSize: 13 },
  offerCard: {
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  offerTitle: { fontSize: 26, fontWeight: "bold", color: colors.white },
  offerSubtitle: { marginTop: 6, fontSize: 11, color: colors.white + "E6", lineHeight: 16, width: 170 },
  offerButton: { marginTop: 16, backgroundColor: colors.white, alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  offerButtonText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  offerImage: { width: 90, height: 90, resizeMode: "contain" },
});