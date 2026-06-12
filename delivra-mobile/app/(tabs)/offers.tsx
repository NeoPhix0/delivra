import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";

// colors supprimé — utiliser l'import depuis @constants/colors

type OfferType = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  validUntil: string;
  color: string;

  // ✅ FIXED TYPE
  gradient: readonly [string, string, ...string[]];

  icon: string;
  image: string;
};

const offers: OfferType[] = [
  {
    id: "1",
    title: "30% OFF",
    subtitle: "On your first delivery order this week",
    code: "DELIVRA30",
    validUntil: "May 30, 2024",
    color: colors.secondary,

    // ✅ FIX
    gradient: [colors.secondary, colors.secondaryDark],

    icon: "🔥",
    image: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
  },

  {
    id: "2",
    title: "Free Delivery",
    subtitle: "On orders above 2,000 DA",
    code: "FREESHIP",
    validUntil: "June 15, 2024",
    color: colors.success,

    // ✅ FIX
    gradient: [colors.success, colors.success + "CC"],

    icon: "🚚",
    image: "https://cdn-icons-png.flaticon.com/512/3063/3063176.png",
  },

  {
    id: "3",
    title: "20% OFF",
    subtitle: "On food delivery orders",
    code: "FOOD20",
    validUntil: "June 10, 2024",
    color: colors.warning,

    // ✅ FIX
    gradient: [colors.warning, colors.warning + "CC"],

    icon: "🍕",
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  },

  {
    id: "4",
    title: "Buy 1 Get 1 Free",
    subtitle: "On all document delivery services",
    code: "BOGO",
    validUntil: "June 30, 2024",
    color: colors.primary,

    // ✅ FIX
    gradient: [colors.primary, colors.primaryDark],

    icon: "📄",
    image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
  },
];

export default function OffersScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.spring(headerSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),

        Animated.timing(orbAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim2, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),

        Animated.timing(orbAnim2, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleCopyCode = (code: string) => {
    alert(`Code ${code} copied!`);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Special Offers"
          subtitle="Exclusive deals for you"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* OFFERS */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {offers.map((offer, index) => (
            <Animated.View
              key={offer.id}
              style={[
                styles.offerCard,
                {
                  transform: [
                    {
                      translateY: Animated.multiply(
                        slideAnim,
                        new Animated.Value(index * 0.1),
                      ),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={offer.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.offerGradient}
              >
                <View style={styles.offerContent}>
                  <View style={styles.offerHeader}>
                    <Text style={styles.offerIcon}>{offer.icon}</Text>

                    <Text style={styles.offerTitle}>{offer.title}</Text>
                  </View>

                  <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>

                  <View style={styles.offerFooter}>
                    <Text style={styles.offerValid}>
                      Valid until {offer.validUntil}
                    </Text>

                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => handleCopyCode(offer.code)}
                      activeOpacity={0.85}
                    >
                      <Feather name="copy" size={14} color={offer.color} />

                      <Text
                        style={[styles.copyButtonText, { color: offer.color }]}
                      >
                        {offer.code}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Image
                  source={{ uri: offer.image }}
                  style={styles.offerImage}
                />
              </LinearGradient>
            </Animated.View>
          ))}
        </Animated.View>

        {/* BANNER */}
        <Animated.View
          style={[
            styles.banner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>⚡ Limited Time Offer</Text>

              <Text style={styles.bannerText}>
                Get exclusive deals when you order now!
              </Text>

              <TouchableOpacity
                style={styles.bannerButton}
                onPress={() =>
                  router.push("/client/create-delivery/step1-category")
                }
                activeOpacity={0.85}
              >
                <Text style={styles.bannerButtonText}>Order Now →</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
              }}
              style={styles.bannerImage}
            />
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  offerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  offerGradient: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  offerContent: {
    flex: 1,
  },

  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  offerIcon: {
    fontSize: 24,
  },

  offerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },

  offerSubtitle: {
    fontSize: 12,
    color: colors.white + "E6",
    marginBottom: 12,
  },

  offerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  offerValid: {
    fontSize: 10,
    color: colors.white + "B3",
  },

  copyButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: colors.white,

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 20,
    gap: 6,
  },

  copyButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },

  offerImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },

  banner: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,

    borderRadius: 24,

    overflow: "hidden",

    shadowColor: colors.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.25,
    shadowRadius: 12,

    elevation: 5,
  },

  bannerGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  bannerContent: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },

  bannerText: {
    fontSize: 11,
    color: colors.white + "E6",
    marginBottom: 12,
  },

  bannerButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  bannerButtonText: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 12,
  },

  bannerImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
});
