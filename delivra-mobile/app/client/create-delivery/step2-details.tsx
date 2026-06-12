import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
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
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SharedHeader } from "@components/shared/SharedHeader";
import { httpClient } from '@services/httpClient';


export default function DeliveryDetailsScreen() {
  const { categoryId, categoryIcon } = useLocalSearchParams();
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{lat: number, lng: number} | null>(null);
  const [activeField, setActiveField] = useState<'pickup' | 'delivery' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 36.7538,
    longitude: 3.0588,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
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

    // Floating orb animations
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

    // Button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) return;
    try {
      const response = await httpClient.post('/geocode/search', { query });
      setSearchResults(response);
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const selectSearchResult = (result: any) => {
    const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    const address = result.display_name;
    if (activeField === 'pickup') {
      setPickupAddress(address);
      setPickupCoords(coords);
    } else {
      setDeliveryAddress(address);
      setDeliveryCoords(coords);
    }
    setSearchResults([]);
    setSearchQuery('');
    setShowMap(true);
    setMapRegion({
      latitude: coords.lat,
      longitude: coords.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSelectedCoords({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
  };

  const openSearch = (field: 'pickup' | 'delivery') => {
    setActiveField(field);
    setSearchQuery(field === 'pickup' ? pickupAddress : deliveryAddress);
    setSearchResults([]);
    setSelectedCoords(null);
  };

  const handleContinue = () => {
    if (!pickupAddress || !deliveryAddress || !pickupPhone || !deliveryPhone) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (!weight) {
      Alert.alert("Error", "Please enter weight");
      return;
    }
    router.push({
      pathname: "/client/order-confirmation",
      params: {
        categoryId: String(categoryId || ""),
        categoryIcon: String(categoryIcon || ""),
        pickupAddress: String(pickupAddress),
        deliveryAddress: String(deliveryAddress),
        pickupPhone: String(pickupPhone),
        deliveryPhone: String(deliveryPhone),
        description: String(description || ""),
        weight: String(weight),
        pickupLat: String(pickupCoords?.lat || ''),
        pickupLng: String(pickupCoords?.lng || ''),
        deliveryLat: String(deliveryCoords?.lat || ''),
        deliveryLng: String(deliveryCoords?.lng || ''),
      },
    });
  };

  const getCategoryInfo = () => {
    const icons: Record<string, string> = {
      documents: "📄",
      food: "🍕",
      electronics: "📱",
      clothing: "👕",
      grocery: "🛒",
      other: "📦",
    };
    const names: Record<string, string> = {
      documents: "Documents",
      food: "Food",
      electronics: "Electronics",
      clothing: "Clothing",
      grocery: "Grocery",
      other: "Other",
    };
    const catColors: Record<string, string> = {
      documents: colors.primary,
      food: colors.secondary,
      electronics: colors.primary,
      clothing: colors.success,
      grocery: colors.secondary,
      other: colors.primary,
    };
    return {
      icon: icons[categoryId as string] || icons[categoryIcon as string] || "📦",
      name: names[categoryId as string] || names[categoryIcon as string] || "Other",
      color: catColors[categoryId as string] || catColors[categoryIcon as string] || colors.primary,
    };
  };

  const categoryInfo = getCategoryInfo();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SharedHeader
          title="Delivery Details"
          subtitle="Fill in your delivery info"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Progress Indicator — standalone card below header */}
        <Animated.View style={[styles.progressWrapper, { opacity: fadeAnim }]}>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressStep, styles.progressStepDone]}>
                <Feather name="check" size={16} color={colors.white} />
              </View>
              <View style={styles.progressConnector}>
                <View style={styles.progressConnectorFill} />
              </View>
              <LinearGradient
                colors={[colors.secondary, colors.secondaryLight]}
                style={[styles.progressStep, styles.progressStepActive]}
              >
                <Text style={styles.progressStepActiveText}>2</Text>
              </LinearGradient>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelDone}>Category</Text>
              <Text style={styles.progressLabelActive}>Details</Text>
            </View>
          </View>
        </Animated.View>

        {/* Selected Category Card */}
        <Animated.View
          style={[
            styles.categoryCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[colors.white, colors.primarySoft]}
            style={styles.categoryCardGradient}
          >
            <View style={styles.categoryCardBadge}>
              <Text style={styles.categoryCardBadgeText}>Selected</Text>
            </View>
            <View style={styles.categoryCardContent}>
              <LinearGradient
                colors={[categoryInfo.color + "20", categoryInfo.color + "10"]}
                style={styles.categoryIconWrapper}
              >
                <Text style={styles.categoryCardIcon}>{categoryInfo.icon}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.categoryCardLabel}>Category</Text>
                <Text
                  style={[
                    styles.categoryCardName,
                    { color: categoryInfo.color },
                  ]}
                >
                  {categoryInfo.name}
                </Text>
              </View>
              <View style={styles.categoryChevron}>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.grayLight}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Pickup Details */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[colors.primarySoft, colors.primarySoft]}
              style={styles.sectionIconBg}
            >
              <Feather name="map-pin" size={16} color={colors.primary} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Pickup Details</Text>
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "pickupAddress" && styles.inputFocused,
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                focusedField === "pickupAddress" && styles.inputIconFocused,
              ]}
            >
              <Feather
                name="home"
                size={18}
                color={
                  focusedField === "pickupAddress"
                    ? colors.primary
                    : colors.grayLight
                }
              />
            </View>
            <TouchableOpacity onPress={() => openSearch('pickup')} style={styles.input}>
              <Text style={pickupAddress ? styles.input : styles.inputPlaceholder}>
                {pickupAddress || 'Search pickup address...'}
              </Text>
            </TouchableOpacity>
            {pickupAddress.length > 0 && (
              <View style={styles.inputCheck}>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
            )}
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "pickupPhone" && styles.inputFocused,
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                focusedField === "pickupPhone" && styles.inputIconFocused,
              ]}
            >
              <Feather
                name="phone"
                size={18}
                color={
                  focusedField === "pickupPhone"
                    ? colors.primary
                    : colors.grayLight
                }
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Contact Number"
              placeholderTextColor={colors.grayLight}
              value={pickupPhone}
              onChangeText={setPickupPhone}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField("pickupPhone")}
              onBlur={() => setFocusedField(null)}
            />
            {pickupPhone.length > 0 && (
              <View style={styles.inputCheck}>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Delivery Details */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: Animated.multiply(
                    slideAnim,
                    new Animated.Value(1.15),
                  ),
                },
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[colors.secondarySoft, colors.secondarySoft]}
              style={styles.sectionIconBg}
            >
              <Feather name="navigation" size={16} color={colors.secondary} />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
              Delivery Details
            </Text>
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "deliveryAddress" && styles.inputFocusedOrange,
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                focusedField === "deliveryAddress" &&
                  styles.inputIconFocusedOrange,
              ]}
            >
              <Feather
                name="map"
                size={18}
                color={
                  focusedField === "deliveryAddress"
                    ? colors.secondary
                    : colors.grayLight
                }
              />
            </View>
            <TouchableOpacity onPress={() => openSearch('delivery')} style={styles.input}>
              <Text style={deliveryAddress ? styles.input : styles.inputPlaceholder}>
                {deliveryAddress || 'Search delivery address...'}
              </Text>
            </TouchableOpacity>
            {deliveryAddress.length > 0 && (
              <View style={styles.inputCheck}>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
            )}
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "deliveryPhone" && styles.inputFocusedOrange,
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                focusedField === "deliveryPhone" &&
                  styles.inputIconFocusedOrange,
              ]}
            >
              <Feather
                name="phone-call"
                size={18}
                color={
                  focusedField === "deliveryPhone"
                    ? colors.secondary
                    : colors.grayLight
                }
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Delivery Contact Number"
              placeholderTextColor={colors.grayLight}
              value={deliveryPhone}
              onChangeText={setDeliveryPhone}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField("deliveryPhone")}
              onBlur={() => setFocusedField(null)}
            />
            {deliveryPhone.length > 0 && (
              <View style={styles.inputCheck}>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Additional Info */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: Animated.multiply(
                    slideAnim,
                    new Animated.Value(1.3),
                  ),
                },
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[colors.primarySoft, colors.primarySoft + "CC"]}
              style={styles.sectionIconBg}
            >
              <Feather name="file-text" size={16} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Additional Info
            </Text>
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "description" && styles.inputFocused,
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                { alignSelf: "flex-start", marginTop: 14 },
                focusedField === "description" && styles.inputIconFocused,
              ]}
            >
              <Feather
                name="edit-2"
                size={18}
                color={
                  focusedField === "description"
                    ? colors.primary
                    : colors.grayLight
                }
              />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.grayLight}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "weight" && styles.inputFocused,
            ]}
          >
            <View
              style={[
                styles.inputIconWrapper,
                focusedField === "weight" && styles.inputIconFocused,
              ]}
            >
              <Feather
                name="package"
                size={18}
                color={
                  focusedField === "weight" ? colors.primary : colors.grayLight
                }
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              placeholderTextColor={colors.grayLight}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              onFocus={() => setFocusedField("weight")}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={styles.inputSuffix}>kg</Text>
          </View>
        </Animated.View>

        {/* Find Drivers Button */}
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
              style={styles.findButton}
            >
              <View style={styles.findButtonIcon}>
                <Feather name="search" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.findButtonText}>Continue</Text>
              <Feather name="arrow-right" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary accent below button */}
          <View style={styles.buttonAccent} />
        </Animated.View>
      </ScrollView>

      {activeField && (
        <View style={styles.searchOverlay}>
          {/* Header */}
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>Search Address</Text>
            <TouchableOpacity onPress={() => { setShowMap(false); setActiveField(null); }}>
              <Feather name="x" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Type an address..."
            placeholderTextColor={colors.grayLight}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
              }
              searchDebounceRef.current = setTimeout(() => {
                searchAddress(text);
              }, 500);
            }}
            autoFocus
          />

          {/* Results List */}
          <ScrollView
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map((result: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultItem}
                onPress={() => selectSearchResult(result)}
              >
                <Feather name="map-pin" size={16} color={colors.primary} />
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {result.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Map Preview */}
          {selectedCoords && Platform.OS !== 'web' && (
            <View style={styles.mapPreview}>
              <MapView
                provider={PROVIDER_DEFAULT}
                style={{ flex: 1 }}
                region={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={selectedCoords} />
              </MapView>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.searchConfirmButton,
              !selectedCoords && styles.searchConfirmButtonDisabled,
            ]}
            onPress={() => {
              if (!selectedCoords) return;
              setShowMap(false);
              setActiveField(null);
            }}
            disabled={!selectedCoords}
          >
            <Text style={styles.searchConfirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
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
  progressStepDone: {
    backgroundColor: colors.success,
  },
  progressStepActive: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
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
  progressConnectorFill: {
    width: "100%",
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
  progressLabelDone: {
    fontSize: 11,
    color: colors.grayLight,
    fontWeight: "600",
  },
  progressLabelActive: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
  },

  // Category Card
  categoryCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryCardGradient: {
    padding: 16,
  },
  categoryCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight + "40",
  },
  categoryCardBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  categoryCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  categoryCardIcon: {
    fontSize: 24,
  },
  categoryCardLabel: {
    fontSize: 11,
    color: colors.grayLight,
    fontWeight: "500",
    marginBottom: 2,
  },
  categoryCardName: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  categoryChevron: {
    marginLeft: "auto",
  },

  // Sections
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.2,
  },

  // Inputs
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.graySoft,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingRight: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: colors.white,
  },
  inputFocusedOrange: {
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.graySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  inputIconFocused: {
    backgroundColor: colors.primarySoft,
  },
  inputIconFocusedOrange: {
    backgroundColor: colors.secondarySoft,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.black,
    fontWeight: "500",
  },
  inputPlaceholder: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.grayLight,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  inputCheck: {
    marginLeft: 8,
  },
  inputSuffix: {
    fontSize: 13,
    color: colors.grayLight,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Button
  buttonWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  findButton: {
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
  findButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.white + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  findButtonText: {
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

  // Search Overlay
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    zIndex: 1000,
    padding: 16,
    paddingTop: 52,
    flexDirection: 'column',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  searchInput: {
    backgroundColor: colors.graySoft,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  searchResults: {
    flex: 1,
    marginVertical: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.graySoft,
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  searchMap: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
  },
  mapPreview: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  searchConfirmButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 26,
  },
  searchConfirmButtonDisabled: {
    backgroundColor: colors.grayLight,
    opacity: 0.6,
  },
  searchConfirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
