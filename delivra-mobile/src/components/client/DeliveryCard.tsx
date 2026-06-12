import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "@constants/colors";
import { StatusBadge } from "@components/shared/StatusBadge";

export interface DeliveryItem {
  id: string;
  category: string;
  driver: string;
  status: string;
  date: string;
  price: string;
  icon: string;
  bgColor: string;
}

interface DeliveryCardProps {
  delivery: DeliveryItem;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery }) => {
  return (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: "/client/order-tracking" })}
    >
      <View style={styles.orderCardInner}>
        <View style={styles.orderLeft}>
          <View style={[styles.orderIcon, { backgroundColor: delivery.bgColor }]}>
            <Text style={styles.orderIconText}>{delivery.icon}</Text>
          </View>
          <View>
            <Text style={styles.orderCategory}>{delivery.category}</Text>
            <Text style={styles.orderDriver}>
              {delivery.driver} • {delivery.date}
            </Text>
            <StatusBadge status={delivery.status} />
          </View>
        </View>
        <Text style={styles.orderPrice}>{delivery.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    marginBottom: 12,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  orderCardInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  orderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  orderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  orderIconText: {
    fontSize: 24,
  },
  orderCategory: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 2,
  },
  orderDriver: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.primary,
  },
});