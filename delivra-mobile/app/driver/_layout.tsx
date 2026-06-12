import colors from "@constants/colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function DriverLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grayLight,
      }}
    >
      {/* Onglet 1 — Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      {/* Onglet 2 — Requests */}
      <Tabs.Screen
        name="incoming-requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color }) => (
            <Feather name="inbox" size={22} color={color} />
          ),
        }}
      />
      {/* Onglet 3 — Earnings */}
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cash-outline" size={22} color={color} />
          ),
        }}
      />
      {/* Onglet 4 — Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={22} color={color} />
          ),
        }}
      />
      {/* Écrans cachés (accessibles via router.push) */}
      <Tabs.Screen name="profile" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="terms" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="privacy" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="help-center" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="contact-support" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="active-delivery" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="available-deliveries" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="delivery-history" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="order-details" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="ratings-reviews" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="withdraw-earnings" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}