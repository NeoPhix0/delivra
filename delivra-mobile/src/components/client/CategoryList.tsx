import { router } from "expo-router";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export interface Category {
  id: string;
  name: string;
  image: string;
  color: string;
  bgColor: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>📂 Categories</Text>
          <Text style={styles.sectionSubtitle}>Choose what to deliver</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: "/client/create-delivery/step1-category" })}>
          <Text style={styles.seeAll}>View All →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesGrid}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.categoryCard, { backgroundColor: cat.bgColor }]} activeOpacity={0.85}>
            <View style={[styles.categoryIcon, { backgroundColor: cat.color + "20" }]}>
              <Image source={{ uri: cat.image }} style={styles.categoryImage} />
            </View>
            <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
            <Text style={styles.categoryCount}>Fast delivery</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.black },
  sectionSubtitle: { fontSize: 12, color: colors.gray, marginTop: 2 },
  seeAll: { color: colors.secondary, fontWeight: "600", fontSize: 13 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  categoryCard: { width: cardWidth, borderRadius: 24, paddingVertical: 16, alignItems: "center" },
  categoryIcon: { width: 64, height: 64, borderRadius: 32, overflow: "hidden", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  categoryImage: { width: "100%", height: "100%", resizeMode: "cover" },
  categoryName: { fontSize: 14, fontWeight: "600" },
  categoryCount: { marginTop: 4, color: colors.gray, fontSize: 10 },
});