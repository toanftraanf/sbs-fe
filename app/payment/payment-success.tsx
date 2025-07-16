import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function PaymentSuccess() {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["#fff", "#E5E5E5"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        {/* Header */}
        <View style={{ width: "100%", alignItems: "center", marginBottom: 24 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#4CAF50",
              marginTop: 16,
            }}
          >
            Thanh Toán Thành Công
          </Text>
        </View>

        {/* Success Icon */}
        <View
          style={{
            backgroundColor: "#4CAF50",
            borderRadius: 999,
            width: 100,
            height: 100,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <Ionicons name="checkmark" size={64} color="#fff" />
        </View>

        {/* Success Message */}
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            color: "#444",
            textAlign: "center",
          }}
        >
          Giao dịch đã thanh toán thành công
        </Text>
        <Text
          style={{
            color: "#666",
            textAlign: "center",
            marginTop: 8,
            marginBottom: 32,
          }}
        >
          Cám ơn bạn, bạn đã thanh toán thành công cho đơn hàng của mình
        </Text>

        {/* Home Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#7CB518",
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
            width: "80%",
            alignItems: "center",
            marginTop: 16,
          }}
          onPress={() => navigation.navigate("menu" as never)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Về Trang Chủ
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
