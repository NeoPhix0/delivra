import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";
import { categoryService } from "@services/api";


const { width } = Dimensions.get("window");
const circleSize = (width - 60) / 2.2;

const categoryImages: Record<string, string> = {
  documents:
    "https://i.pinimg.com/1200x/30/82/54/308254a07b8a2ae04718cd567a2c2705.jpg",
  food: "https://i.pinimg.com/1200x/72/d9/af/72d9af964d384fc2a16fd087c1062a7c.jpg",
  electronics:
    "https://i.pinimg.com/736x/8e/47/31/8e47318579d0592c90dd3a1bbe66580e.jpg",
  clothing:
    "https://i.pinimg.com/1200x/49/37/4b/49374b0ff961f155d6c3c4beb41db662.jpg",
  grocery:
    "https://i.pinimg.com/736x/c7/2e/fd/c72efd19c50ed0962c55e2938c146132.jpg",
  other:
    "https://i.pinimg.com/736x/36/b7/e3/36b7e31349116916a7bea8c27d79b642.jpg",
};

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  image?: string;
  orders?: string;
  order_count?: number;
  slug?: string;
}

const defaultCategories: Category[] = [
  { id: "documents", name: "Documents", image: categoryImages.documents, color: colors.primary, bgColor: colors.primarySoft, orders: "134+" },
  { id: "food", name: "Food", image: categoryImages.food, color: colors.secondary, bgColor: colors.secondarySoft, orders: "342+" },
  { id: "electronics", name: "Electronics", image: categoryImages.electronics, color: colors.primary, bgColor: colors.primarySoft, orders: "156+" },
  { id: "clothing", name: "Clothing", image: categoryImages.clothing, color: colors.success, bgColor: colors.success + "20", orders: "189+" },
  { id: "grocery", name: "Grocery", image: categoryImages.grocery, color: colors.secondary, bgColor: colors.secondarySoft, orders: "267+" },
  { id: "other", name: "Other", image: categoryImages.other, color: colors.primary, bgColor: colors.primarySoft, orders: "98+" },
];

export default function SelectCategoryScreen() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "other");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      const items = Array.isArray(data) ? data : (data?.categories || []);
      
      if (items.length > 0) {
        const categoryColors: string[] = [colors.primary, colors.secondary, colors.success, colors.warning, colors.primary, colors.secondary];
        const transformed: Category[] = items.map((cat: any, index: number) => ({
          id: cat.id || cat.icon || String(index),
          name: cat.name || 'Other',
          image: cat.image || categoryImages[cat.icon || 'other'] || categoryImages.other,
          color: categoryColors[index % categoryColors.length],
          bgColor: categoryColors[index % categoryColors.length] + "15",
          orders: cat.order_count ? `${cat.order_count}+` : "0+",
          slug: cat.icon || cat.name?.toLowerCase() || 'other',
        }));
        setCategories(transformed);
        setSelectedCategory(transformed[0].id);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
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

  const handleContinue = () => {
    router.push({
      pathname: "/client/create-delivery/step2-details",
      params: {
        categoryId: selectedCategory,
        categoryIcon: categories.find(c => c.id === selectedCategory)?.slug || 'other',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SharedHeader
          title="Create Delivery"
          subtitle="Select your package type"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Progress Card */}
        <Animated.View style={[styles.progressWrapper, { opacity: fadeAnim }]}>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[colors.secondary, colors.secondaryLight]}
                style={[styles.progressStep, styles.progressStepActive]}
              >
                <Text style={styles.progressStepActiveText}>1</Text>
              </LinearGradient>
              <View style={styles.progressConnector}>
                <View style={styles.progressConnectorEmpty} />
              </View>
              <View style={styles.progressStep}>
                <Text style={styles.progressStepText}>2</Text>
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelActive}>Category</Text>
              <Text style={styles.progressLabelPending}>Details</Text>
            </View>
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Choose Category</Text>
          <Text style={styles.sectionSubtitle}>
            What would you like to deliver today?
          </Text>
        </Animated.View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Animated.View
                key={cat.id}
                style={[
                  styles.categoryWrapper,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryCircle,
                    {
                      backgroundColor: isSelected ? cat.bgColor : colors.white,
                      borderColor: isSelected ? cat.color : cat.color + "35",
                      shadowColor: isSelected ? cat.color : colors.grayLight,
                      shadowOpacity: isSelected ? 0.25 : 0.08,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: cat.bgColor },
                    ]}
                  >
                    <Image
                      source={{ uri: cat.image }}
                      style={styles.categoryImage}
                    />
                  </View>

                  {isSelected && (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: cat.color },
                      ]}
                    >
                      <Feather name="check" size={13} color={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>

                <Text
                  style={[
                    styles.categoryName,
                    { color: isSelected ? cat.color : colors.black },
                  ]}
                >
                  {cat.name}
                </Text>
                <Text style={styles.categoryOrders}>{cat.orders} orders</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale: buttonScale }] },
          ]}
        >
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.88}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark, colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButton}
            >
              <View style={styles.continueButtonIcon}>
                <Feather name="layers" size={17} color={colors.secondary} />
              </View>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Feather name="arrow-right" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.buttonAccent} />
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
  scrollContent: {
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.grayLight,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  progressWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  progressContainer: {
    paddingHorizontal: 8,
  },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.graySoft,
  },
  progressStepActive: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  progressStepText: {
    color: colors.grayLight,
    fontWeight: "700",
    fontSize: 14,
  },
  progressStepActiveText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },
  progressConnector: {
    flex: 1,
    height: 4,
    backgroundColor: colors.graySoft,
    marginHorizontal: 10,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressConnectorEmpty: {
    width: "0%",
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  progressLabelActive: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
  },
  progressLabelPending: {
    fontSize: 11,
    color: colors.grayLight,
    fontWeight: "600",
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.black,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 20,
  },
  categoryWrapper: {
    width: circleSize,
    alignItems: "center",
    marginBottom: 20,
  },
  categoryCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  categoryIconContainer: {
    width: circleSize - 35,
    height: circleSize - 35,
    borderRadius: (circleSize - 35) / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selectedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  categoryOrders: {
    fontSize: 11,
    color: colors.grayLight,
    textAlign: "center",
    marginTop: 3,
    fontWeight: "500",
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 10,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.white + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.4,
    flex: 1,
    textAlign: "center",
  },
  buttonAccent: {
    height: 4,
    marginHorizontal: 32,
    marginTop: 6,
    borderRadius: 2,
    backgroundColor: colors.secondaryLight,
    opacity: 0.3,
  },
});