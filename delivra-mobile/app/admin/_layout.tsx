import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function AdminLayout() {
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="bar-chart-2" size={22} color={color} />
            </View>
          ),
        }}
      />
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
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="grid" size={22} color={color} />
            </View>
          ),
        }}
      />
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
      <Tabs.Screen name="users" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="drivers" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="profile" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}