import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Review {
  id: string;
  customer: string;
  rating: number;
  date: string;
  comment: string;
  orderId: string;
}

// TODO: connect to API when endpoint is available
const reviews: Review[] = [
  {
    id: "1",
    customer: "John Doe",
    rating: 5,
    date: "2024-04-20",
    comment: "Excellent driver! Very professional and arrived early.",
    orderId: "#DEL-001",
  },
  {
    id: "2",
    customer: "Sara Smith",
    rating: 4,
    date: "2024-04-19",
    comment: "Good service, on time.",
    orderId: "#DEL-002",
  },
  {
    id: "3",
    customer: "Mike Johnson",
    rating: 5,
    date: "2024-04-18",
    comment: "Amazing! Will definitely request again.",
    orderId: "#DEL-003",
  },
];

export default function RatingsReviewsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const averageRating = 4.7;
  const totalReviews = reviews.length;

  const rating5Count = reviews.filter((r) => r.rating === 5).length;
  const rating4Count = reviews.filter((r) => r.rating === 4).length;
  const rating3Count = reviews.filter((r) => r.rating === 3).length;
  const rating2Count = reviews.filter((r) => r.rating === 2).length;
  const rating1Count = reviews.filter((r) => r.rating === 1).length;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderReviewCard = ({ item }: ListRenderItemInfo<Review>) => (
    <Animated.View
      style={[
        styles.reviewCard,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.orderId}>{item.orderId}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingStar}>⭐</Text>
          <Text style={styles.ratingValue}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.reviewDate}>{item.date}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Card */}
      <Animated.View
        style={[
          styles.summaryCard,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.averageContainer}>
          <Text style={styles.averageRating}>{averageRating}</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starIconHalf}>⭐</Text>
          </View>
          <Text style={styles.totalReviews}>
            Based on {totalReviews} reviews
          </Text>
        </View>

        {/* Rating Distribution */}
        <View style={styles.distributionContainer}>
          <View style={styles.distributionRow}>
            <Text style={styles.starLabel}>5 ⭐</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(rating5Count / totalReviews) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{rating5Count}</Text>
          </View>
          <View style={styles.distributionRow}>
            <Text style={styles.starLabel}>4 ⭐</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(rating4Count / totalReviews) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{rating4Count}</Text>
          </View>
          <View style={styles.distributionRow}>
            <Text style={styles.starLabel}>3 ⭐</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(rating3Count / totalReviews) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{rating3Count}</Text>
          </View>
          <View style={styles.distributionRow}>
            <Text style={styles.starLabel}>2 ⭐</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(rating2Count / totalReviews) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{rating2Count}</Text>
          </View>
          <View style={styles.distributionRow}>
            <Text style={styles.starLabel}>1 ⭐</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(rating1Count / totalReviews) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{rating1Count}</Text>
          </View>
        </View>
      </Animated.View>

      <Text style={styles.reviewsTitle}>Customer Reviews</Text>

      <FlatList
        data={reviews}
        renderItem={renderReviewCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  averageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.warning,
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  starIcon: {
    fontSize: 20,
    color: colors.warning,
  },
  starIconHalf: {
    fontSize: 20,
    color: colors.warning,
  },
  totalReviews: {
    fontSize: 12,
    color: colors.grayLight,
    marginTop: 8,
  },
  distributionContainer: {
    marginTop: 8,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starLabel: {
    width: 50,
    fontSize: 12,
    color: colors.grayLight,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  progressCount: {
    width: 25,
    fontSize: 11,
    color: colors.grayLight,
    textAlign: "right",
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
  },
  orderId: {
    fontSize: 11,
    color: colors.grayLight,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.warning,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.grayLight,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 13,
    color: colors.black,
    lineHeight: 18,
    fontStyle: "italic",
  },
});
