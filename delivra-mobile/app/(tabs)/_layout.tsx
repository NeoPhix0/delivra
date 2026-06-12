import colors from "@constants/colors";
// app/(tabs)/_layout.tsx

import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
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
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.grayLight,
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="home" size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 2. Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="shopping-bag" size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 3. Offers */}
      <Tabs.Screen
        name="offers"
        options={{
          title: "Offers",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="gift" size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 4. Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="settings" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
