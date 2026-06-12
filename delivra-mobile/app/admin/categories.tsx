import colors from "@constants/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { categoryService } from "@services/api";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  orders: number;
  status: string;
}

const categoryColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.primary, colors.secondary];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      const items = Array.isArray(data) ? data : (data?.categories || []);
      const transformed: Category[] = items.map((cat: any, index: number) => ({
        id: cat.id || cat.slug || String(index),
        name: cat.name || 'Other',
        icon: cat.icon || '📦',
        color: categoryColors[index % categoryColors.length],
        orders: cat.order_count || cat.orders || 0,
        status: cat.status || 'active',
      }));
      setCategories(transformed);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter category name");
      return;
    }
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      icon: newCategoryIcon,
      color: colors.secondary,
      orders: 0,
      status: "active",
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setNewCategoryIcon("📦");
    setIsAdding(false);
    Alert.alert("Success", "Category added successfully");
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter category name");
      return;
    }
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name: editName } : cat)),
    );
    setEditingId(null);
    setEditName("");
    Alert.alert("Success", "Category updated successfully");
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert("Delete Category", `Delete ${category.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
          Alert.alert("Success", "Category deleted successfully");
        },
      },
    ]);
  };

  const handleToggleStatus = (category: Category) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === category.id
          ? { ...cat, status: cat.status === "active" ? "inactive" : "active" }
          : cat,
      ),
    );
    Alert.alert(
      "Success",
      `Category ${category.status === "active" ? "disabled" : "enabled"} successfully`,
    );
  };

  const renderCategoryCard = ({ item }: ListRenderItemInfo<Category>) => (
    <View
      style={[
        styles.categoryCard,
        item.status === "inactive" && styles.inactiveCard,
      ]}
    >
      <View
        style={[
          styles.categoryIconContainer,
          { backgroundColor: item.color + "15" },
        ]}
      >
        <Text style={styles.categoryIcon}>{item.icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        {editingId === item.id ? (
          <TextInput
            style={styles.editInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus
          />
        ) : (
          <Text
            style={[
              styles.categoryName,
              item.status === "inactive" && styles.inactiveText,
            ]}
          >
            {item.name}
          </Text>
        )}
        <Text style={styles.categoryOrders}>{item.orders} orders</Text>
      </View>
      <View style={styles.categoryActions}>
        {editingId === item.id ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSaveEdit(item.id)}
          >
            <Feather name="check" size={18} color={colors.success} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCategory(item)}
            >
              <Feather name="edit-2" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleStatus(item)}
            >
              <Feather
                name={item.status === "active" ? "eye-off" : "eye"}
                size={18}
                color={colors.warning}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCategory(item)}
            >
              <Feather name="trash-2" size={18} color={colors.error} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(true)}
        >
          <Feather name="plus" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAdding && (
        <View style={styles.addCard}>
          <View style={styles.addIconContainer}>
            <TextInput
              style={styles.iconInput}
              value={newCategoryIcon}
              onChangeText={setNewCategoryIcon}
              maxLength={2}
              placeholder="📦"
              textAlign="center"
            />
          </View>
          <TextInput
            style={styles.addInput}
            placeholder="Category name"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            autoFocus
          />
          <View style={styles.addActions}>
            <TouchableOpacity
              style={styles.cancelAddButton}
              onPress={() => setIsAdding(false)}
            >
              <Feather name="x" size={20} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmAddButton}
              onPress={handleAddCategory}
            >
              <Feather name="check" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={categories}
        renderItem={renderCategoryCard}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.white },
  addButton: { padding: 8 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  addIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconInput: { fontSize: 24, textAlign: "center" },
  addInput: { flex: 1, fontSize: 14, paddingVertical: 8 },
  addActions: { flexDirection: "row", gap: 12 },
  cancelAddButton: { padding: 8 },
  confirmAddButton: { padding: 8 },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inactiveCard: { opacity: 0.6 },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryIcon: { fontSize: 24 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: "bold", color: colors.text },
  inactiveText: { textDecorationLine: "line-through", color: colors.textSecondary },
  categoryOrders: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  editInput: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingVertical: 2,
  },
  categoryActions: { flexDirection: "row", gap: 12 },
  actionButton: { padding: 6 },
  saveButton: { padding: 6 },
});
