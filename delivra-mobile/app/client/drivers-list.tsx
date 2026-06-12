import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";
import { deliveryService } from "@services/api";

interface DriverItem {
  id: string;
  name: string;
  rating: number;
  pricePerKm: number;
  distance: number;
  totalPrice: number;
  image: string;
  status: string;
  completed: number;
  vehicle: string;
  email: string;
  phone: string;
  experience?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  zone?: string;
  languages?: string;
  joinDate?: string;
  about?: string;
}

const driverImages = {
  driver1:
    "https://i.pinimg.com/736x/bd/d3/bc/bdd3bc41294ea5a7d04f70c36893d3eb.jpg",
  driver2:
    "https://i.pinimg.com/webp/1200x/1c/85/2e/1c852ea928150dfcf54c5457dbca0a35.webp",
  driver3:
    "https://i.pinimg.com/736x/8c/14/00/8c1400d11a34eb5f3de3d9212da81882.jpg",
  driver4:
    "https://i.pinimg.com/webp/1200x/85/fc/09/85fc097b34bff079cfe2c2ca2c680870.webp",
};

const defaultAvatars = [driverImages.driver1, driverImages.driver2, driverImages.driver3, driverImages.driver4];

const vehicleIcons: Record<string, string> = {
  Motorcycle: "zap",
  Scooter: "wind",
  Car: "truck",
};

export default function DriversListScreen() {
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"price" | "rating" | "distance">("rating");
  const [sortedDrivers, setSortedDrivers] = useState<DriverItem[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const routeParams = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryService.getAvailableDrivers();
      const items = Array.isArray(data) ? data : (data?.drivers || []);
      const transformed: DriverItem[] = items.map((d: any, index: number) => ({
        id: d.id || String(index),
        name: d.full_name || d.name || 'Unknown',
        rating: d.rating || 4.5,
        pricePerKm: d.price_per_km || d.pricePerKm || 2.5,
        distance: d.distance_km || d.distance || 0,
        totalPrice: d.total_price || d.totalPrice || 0,
        image: d.profile_picture || d.image || d.avatar || defaultAvatars[index % defaultAvatars.length],
        status: d.is_online === false ? 'busy' : 'available',
        completed: d.total_deliveries || d.completed_deliveries || d.completed || 0,
        vehicle: d.vehicle_type || d.vehicle || 'Motorcycle',
        email: d.email || '',
        phone: d.phone || '',
        experience: d.experience || `${Math.floor(Math.random() * 5) + 1} years`,
        vehiclePlate: d.vehicle_plate || d.vehiclePlate || 'N/A',
        vehicleColor: d.vehicle_color || d.vehicleColor || 'Black',
        zone: d.zone || d.working_zone || 'Unknown',
        languages: d.languages || 'Arabic, English',
        joinDate: d.join_date || d.joinDate || (d.created_at ? new Date(d.created_at).toLocaleDateString() : ''),
        about: d.about || `Professional driver with experience.`,
      }));
      setDrivers(transformed);
      const available = transformed.filter((d) => d.status === "available");
      setSortedDrivers(available);
    } catch (err: any) {
      console.error('Error loading drivers:', err);
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, []);

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

    loadDrivers();
  }, []);

  const applyFilter = (type: "price" | "rating" | "distance") => {
    setFilter(type);
    const sorted = [...drivers]
      .filter((d) => d.status === "available")
      .sort((a, b) => {
        if (type === "price") return a.totalPrice - b.totalPrice;
        if (type === "rating") return b.rating - a.rating;
        if (type === "distance") return a.distance - b.distance;
        return 0;
      });
    setSortedDrivers(sorted);
  };

  const handleSelectDriver = (driver: DriverItem) => {
    if (driver.status === "available") {
      setSelectedDriver(driver.id);
      setTimeout(() => {
        router.push({
          pathname: "/client/order-confirmation",
          params: {
            ...routeParams,
            driverId: driver.id,
            driverName: driver.name,
            driverRating: driver.rating.toString(),
            driverPrice: driver.pricePerKm.toString(),
            driverImage: driver.image,
          },
        } as any);
      }, 300);
    } else {
      Alert.alert("Not Available", "This driver is currently busy");
    }
  };

  const handleViewDriverProfile = (driver: DriverItem) => {
    router.push({
      pathname: "/client/driver-profile",
      params: {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        rating: driver.rating.toString(),
        pricePerKm: driver.pricePerKm.toString(),
        totalDeliveries: driver.completed.toString(),
        experience: driver.experience,
        vehicle: driver.vehicle,
        vehiclePlate: driver.vehiclePlate,
        vehicleColor: driver.vehicleColor,
        zone: driver.zone,
        languages: driver.languages,
        joinDate: driver.joinDate,
        about: driver.about,
        image: driver.image,
        verified: "true",
      },
    } as any);
  };

  const renderDriverCard = ({ item }: ListRenderItemInfo<DriverItem>) => {
    const isSelected = selectedDriver === item.id;
    const isAvailable = item.status === "available";

    return (
      <Animated.View
        style={[
          styles.driverCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.driverCardInner,
            isSelected && styles.driverCardSelected,
            !isAvailable && styles.driverCardBusy,
          ]}
          onPress={() => handleSelectDriver(item)}
          activeOpacity={0.75}
        >
          {isSelected && (
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.selectedAccentBar}
            />
          )}

          <View style={styles.driverGradient}>
            <View style={styles.driverHeader}>
              <TouchableOpacity
                onPress={() => handleViewDriverProfile(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.avatarRing,
                    isSelected && styles.avatarRingSelected,
                  ]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.driverAvatarImage}
                  />
                  <View
                    style={[
                      styles.onlineDot,
                      isAvailable ? styles.onlineDotGreen : styles.onlineDotRed,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={13} color={colors.warning} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.completedText}>
                    · {item.completed} trips
                  </Text>
                </View>
                <View style={styles.vehicleRow}>
                  <Feather
                    name={(vehicleIcons[item.vehicle] as any) || "truck"}
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={styles.vehicleText}>{item.vehicle}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isAvailable ? styles.statusAvailable : styles.statusBusy,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isAvailable ? styles.statusDotGreen : styles.statusDotRed,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    isAvailable
                      ? styles.statusAvailableText
                      : styles.statusBusyText,
                  ]}
                >
                  {isAvailable ? "Available" : "Busy"}
                </Text>
              </View>
            </View>

            <View style={styles.driverFooter}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Per km</Text>
                  <Text style={styles.statValue}>{item.pricePerKm} DA</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{item.distance} km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.totalPrice}>
                    {item.totalPrice.toFixed(2)} DA
                  </Text>
                </View>
            </View>

            <TouchableOpacity
              style={[
                styles.selectButton,
                !isAvailable && styles.selectButtonDisabled,
              ]}
              onPress={() => handleSelectDriver(item)}
              disabled={!isAvailable}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isSelected
                    ? [colors.success, colors.success + "CC"]
                    : isAvailable
                      ? [colors.secondary, colors.secondaryDark]
                      : [colors.grayLight, colors.graySoft]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.selectButtonGradient}
              >
                <Feather
                  name={isSelected ? "check-circle" : "user-check"}
                  size={16}
                  color={colors.white}
                />
                <Text style={styles.selectButtonText}>
                  {isSelected ? "Selected" : "Select Driver"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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

      <SharedHeader
        title="Available Drivers"
        subtitle="Choose your delivery partner"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDrivers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={[styles.filterWrapper, { opacity: fadeAnim }]}>
        <View style={styles.filterInner}>
          <Text style={styles.filterLabel}>Sort by</Text>
          <View style={styles.filterChips}>
            {(["rating", "price", "distance"] as const).map((type) => {
              const iconMap = {
                rating: "star",
                price: "dollar-sign",
                distance: "map-pin",
              };
              const isActive = filter === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyFilter(type)}
                  activeOpacity={0.8}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={[colors.primary, colors.primaryLight]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.filterChipGradient}
                    >
                      <Feather name={iconMap[type] as any} size={13} color={colors.white} />
                      <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.filterChipInactive}>
                      <Feather name={iconMap[type] as any} size={13} color={colors.grayLight} />
                      <Text style={styles.filterChipText}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={sortedDrivers}
        renderItem={renderDriverCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { backgroundColor: '#FEE2E2', padding: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center' },
  retryButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  filterWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  filterInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterLabel: { fontSize: 13, color: colors.gray, fontWeight: "700" },
  filterChips: { flexDirection: "row", gap: 8 },
  filterChip: { borderRadius: 20, overflow: "hidden" },
  filterChipActive: {},
  filterChipGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    borderRadius: 20,
  },
  filterChipInactive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    backgroundColor: colors.graySoft,
    borderRadius: 20,
  },
  filterChipText: { fontSize: 12, color: colors.grayLight, fontWeight: "600" },
  filterChipTextActive: { color: colors.white },
  listContainer: { paddingHorizontal: 16, paddingBottom: 36, paddingTop: 4 },
  driverCard: { marginBottom: 14 },
  driverCardInner: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  driverCardSelected: { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.15, elevation: 6 },
  driverCardBusy: { opacity: 0.7 },
  selectedAccentBar: { height: 4, width: "100%" },
  driverGradient: { padding: 16 },
  driverHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  avatarRing: {
    width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: colors.graySoft,
    alignItems: "center", justifyContent: "center", marginRight: 14, position: "relative",
  },
  avatarRingSelected: { borderColor: colors.primary },
  driverAvatarImage: { width: 54, height: 54, borderRadius: 27, resizeMode: "cover" },
  onlineDot: { position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.white },
  onlineDotGreen: { backgroundColor: colors.success },
  onlineDotRed: { backgroundColor: colors.error },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: "800", color: colors.black, marginBottom: 4, letterSpacing: 0.1 },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 3 },
  ratingText: { fontSize: 12, color: colors.warning, fontWeight: "700" },
  completedText: { fontSize: 11, color: colors.grayLight },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  vehicleText: { fontSize: 11, color: colors.primary, fontWeight: "600" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5, alignSelf: "flex-start" },
  statusAvailable: { backgroundColor: colors.success + "18" },
  statusBusy: { backgroundColor: colors.error + "15" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotGreen: { backgroundColor: colors.success },
  statusDotRed: { backgroundColor: colors.error },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2 },
  statusAvailableText: { color: colors.success },
  statusBusyText: { color: colors.error },
  driverFooter: { flexDirection: "row", alignItems: "center", backgroundColor: colors.background, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, marginBottom: 14 },
  statBox: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 10, color: colors.grayLight, marginBottom: 4, fontWeight: "500" },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.black },
  totalPrice: { fontSize: 17, fontWeight: "800", color: colors.secondary },
  statDivider: { width: 1, height: 28, backgroundColor: colors.graySoft },
  selectButton: { borderRadius: 16, overflow: "hidden" },
  selectButtonDisabled: { opacity: 0.5 },
  selectButtonGradient: { flexDirection: "row", paddingVertical: 13, alignItems: "center", justifyContent: "center", gap: 8 },
  selectButtonText: { color: colors.white, fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },
});