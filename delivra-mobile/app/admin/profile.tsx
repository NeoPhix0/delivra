import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@delivra.com");
  const [phone, setPhone] = useState("+213 5XX XX XX XX");

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.push("/admin/settings")}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <View style={styles.editButton}>
            <Feather
              name={isEditing ? "x" : "edit-2"}
              size={14}
              color={colors.white}
            />
            <Text style={styles.editButtonText}>
              {isEditing ? "Cancel" : "Edit"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👑</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text style={styles.infoValue}>{name}</Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{email}</Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{phone}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    backgroundColor: colors.white + "33",
  },
  editButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 48,
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  infoInput: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});
