import colors from "@constants/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { deliveryService } from "@services/api";


const { width } = Dimensions.get("window");
// عرض كل دائرة لتناسب فئتين في السطر
const circleSize = (width - 60) / 2; // 20 padding left + 20 padding right + 20 gap

const categories = [
  {
    id: "food",
    name: "Food",
    icon: "🍕",
    color: colors.secondary,
    bgColor: colors.secondary + "15",
    orders: "342+",
    tag: "Popular",
  },
  {
    id: "clothes",
    name: "Clothes",
    icon: "👕",
    color: colors.success,
    bgColor: colors.success + "15",
    orders: "189+",
    tag: "Trending",
  },
  {
    id: "grocery",
    name: "Grocery",
    icon: "🛒",
    color: colors.success,
    bgColor: colors.success + "15",
    orders: "267+",
    tag: "Fresh",
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    color: colors.primary,
    bgColor: colors.primary + "15",
    orders: "156+",
    tag: "Tech",
  },
  {
    id: "documents",
    name: "Documents",
    icon: "📄",
    color: colors.primary,
    bgColor: colors.primary + "15",
    orders: "134+",
    tag: "Secure",
  },
  {
    id: "others",
    name: "Others",
    icon: "📦",
    color: colors.primary,
    bgColor: colors.primarySoft,
    orders: "98+",
    tag: "Any",
  },
];

export default function CreateDeliveryScreen() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFindDrivers = async () => {
    if (!pickupAddress || !deliveryAddress || !pickupPhone || !deliveryPhone) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (!weight) {
      Alert.alert("Error", "Please enter weight");
      return;
    }

    try {
      setLoading(true);

      router.push({
        pathname: "/client/drivers-list",
        params: {
          pickupAddress: String(pickupAddress || ""),
          deliveryAddress: String(deliveryAddress || ""),
          pickupPhone: String(pickupPhone || ""),
          deliveryPhone: String(deliveryPhone || ""),
          description: String(description || ""),
          weight: String(weight || "0"),
        },
      });
    } catch (error: any) {
      console.error("Create delivery error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create delivery. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Delivery</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Category Section */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <Text style={styles.sectionSubtitle}>
            Choose what type of item you want to deliver
          </Text>

          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryWrapper}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    { borderColor: cat.color },
                    selectedCategory === cat.id && styles.categoryCircleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: cat.bgColor },
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  </View>
                  {selectedCategory === cat.id && (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: cat.color },
                      ]}
                    >
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.categoryName, { color: cat.color }]}>
                  {cat.name}
                </Text>
                <Text style={styles.categoryOrders}>{cat.orders} orders</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pickup Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Pickup Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main Street, City"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholderTextColor={colors.gray}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+213 5XX XX XX XX"
              value={pickupPhone}
              onChangeText={setPickupPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.gray}
            />
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Delivery Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="456 Oak Avenue, City"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholderTextColor={colors.gray}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+213 5XX XX XX XX"
              value={deliveryPhone}
              onChangeText={setDeliveryPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.gray}
            />
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Info</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your package..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.gray}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor={colors.gray}
            />
          </View>
        </View>

        {/* Find Drivers Button */}
        <TouchableOpacity 
          style={styles.findButton} 
          onPress={handleFindDrivers}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.findButtonText}>Find Drivers →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
  },
  categorySection: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  categoryWrapper: {
    width: circleSize,
    alignItems: "center",
    marginBottom: 16,
  },
  categoryCircle: {
    width: circleSize - 10,
    height: circleSize - 10,
    borderRadius: (circleSize - 10) / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    position: "relative",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCircleActive: {
    borderWidth: 3,
    backgroundColor: colors.primarySoft,
  },
  categoryIconContainer: {
    width: circleSize - 10 - 20,
    height: circleSize - 10 - 20,
    borderRadius: (circleSize - 10 - 20) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 32,
  },
  selectedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  categoryOrders: {
    fontSize: 10,
    color: colors.gray,
    textAlign: "center",
  },
  section: {
    marginTop: 24,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  findButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  findButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
