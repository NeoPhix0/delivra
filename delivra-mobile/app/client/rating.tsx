import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deliveryService } from "@services/api";
import { SharedHeader } from "@components/shared/SharedHeader";

export default function RatingScreen() {
  const { id } = useLocalSearchParams();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    loadDelivery();
  }, [id]);

  const loadDelivery = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveryById(id as string);
      const data = response.delivery || response;
      setDelivery(data);
    } catch (error) {
      console.error("Error loading delivery:", error);
      Alert.alert("Error", "Failed to load delivery details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating < 1) return;
    try {
      setSubmitting(true);
      await deliveryService.rateDelivery(id as string, rating, review || undefined);
      Alert.alert("Thank you!", "Your rating has been submitted", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || "Failed to submit rating";
      if (message.includes("déjà été notée") || message.includes("already rated")) {
        Alert.alert("Already Rated", message, [
          { text: "Go Home", onPress: () => router.replace("/(tabs)") },
        ]);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <SharedHeader title="Rate Your Delivery" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const driverName = delivery?.driver?.fullName || "Driver";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SharedHeader
          title="Rate Your Delivery"
          subtitle="How was your experience?"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Driver Info Card */}
        <View style={styles.card}>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Feather name="user" size={24} color={colors.grayLight} />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverName}</Text>
              <Text style={styles.driverSubtext}>
                {delivery?.trackingNumber || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Star Rating */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate your experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Feather
                  name="star"
                  size={32}
                  color={star <= rating ? colors.warning : colors.grayLight}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingHint}>
              {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
            </Text>
          )}
        </View>

        {/* Review Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share your experience (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us about your delivery..."
            placeholderTextColor={colors.grayLight}
            multiline
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, rating < 1 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating < 1 || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Feather name="star" size={18} color={colors.white} />
              <Text style={styles.submitButtonText}>Submit Rating</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 16,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  driverSubtext: {
    fontSize: 12,
    color: colors.grayLight,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingHint: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: colors.warning,
  },
  textInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: colors.primary,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});