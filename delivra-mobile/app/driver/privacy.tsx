import colors from "@constants/colors";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <SharedHeader
        title="Privacy Policy"
        showBackButton={true}
        onBackPress={() => router.push("/driver/settings")}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>Privacy Policy Coming Soon</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16, color: colors.black },
});