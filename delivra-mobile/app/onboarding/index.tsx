import colors from "@constants/colors";
// app/onboarding/index.tsx
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";


const { width, height } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
}

// صور لكل شاشة
// ★★★ روابط صور Onboarding - جاهزة للنسخ ★★★

const slides: Slide[] = [
  {
    id: "1",
    title: "Fresh Groceries,\nDelivered Every Day",
    description:
      "Handpicked local produce delivered fresh from nearby farms to you.",
    image:
      "https://i.pinimg.com/736x/bc/49/c2/bc49c2d89c2453fd35fdbdd2bab7dbd8.jpg",
  },
  {
    id: "2",
    title: "Track Your Order\nIn Real Time",
    description: "Know exactly where your package is with live GPS tracking.",
    image:
      "https://i.pinimg.com/736x/52/e2/bf/52e2bf6330b8dcdb9e2370928fa94607.jpg",
  },
  {
    id: "3",
    title: "Fast & Secure\nDelivery",
    description: "Your packages are safe with our insured delivery service.",
    image:
      "https://i.pinimg.com/736x/fc/1b/09/fc1b095cb7e1224a8d870c1fffe95d7a.jpg",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/welcome");
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={styles.slide}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* الصورة مع التقويس */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />

        {/* التقويس السفلي */}
        <Svg
          height={80}
          width={width}
          viewBox={`0 0 ${width} 80`}
          style={styles.svgCurve}
        >
          <Path
            d={`M0 0 Q ${width / 2} 80 ${width} 0 L${width} 80 L0 80 Z`}
            fill="white"
          />
        </Svg>
      </View>

      {/* النصوص */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* النقاط السفلية */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, currentIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* الأزرار */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Feather name="arrow-right" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    width,
    flex: 1,
    backgroundColor: colors.white,
  },
  imageContainer: {
    width: width,
    height: height * 0.7,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  svgCurve: {
    position: "absolute",
    bottom: -1,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  description: {
    fontSize: 15,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  pagination: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.grayLight,
    marginHorizontal: 5,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "500",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
