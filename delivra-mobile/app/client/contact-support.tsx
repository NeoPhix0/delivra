import colors from "@constants/colors";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SharedHeader } from "@components/shared/SharedHeader";

export default function ClientContactSupportScreen() {
  return (
    <View style={styles.container}>
      <SharedHeader
        title="Contact Support"
        showBackButton={true}
        onBackPress={() => router.push("/client/settings")}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>Contact Support Content Coming Soon</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16, color: colors.black },
});