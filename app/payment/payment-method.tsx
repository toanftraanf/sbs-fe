import AppButton from "@/components/AppButton";
import ScreenHeader from "@/components/ScreenHeader";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCards } from "@/hooks/useCards";
import { usePayment } from "@/hooks/usePayment";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentMethod() {
  const { card, loading: cardLoading, refetch } = useCards();
  const { handlePayment, loading: paymentLoading } = usePayment();
  const { selectedSubscription } = useSubscription();
  const [isCardSectionCollapsed, setIsCardSectionCollapsed] = useState(false);
  const navigation = useNavigation();
  // Show loading state while fetching data
  const isLoading = cardLoading;

  // Refresh card when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Payment method screen focused, refetching card...");
      refetch();
    }, [])
  );

  console.log("Payment method render - card:", card, "loading:", isLoading);

  const handlePayButton = () => {
    if (!card) {
      Alert.alert("Lỗi", "Vui lòng thêm thẻ thanh toán trước khi thanh toán");
      return;
    }

    if (!selectedSubscription) {
      Alert.alert("Lỗi", "Vui lòng chọn gói subscription trước khi thanh toán");
      return;
    }

    handlePayment(card, selectedSubscription);
  };

  return (
    <LinearGradient
      colors={["#F5F5F5", "#E5E5E5"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader title="Phương thức thanh toán" />
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
            {/* Credit/Debit Card Section */}
            <View className="bg-white rounded-2xl shadow-md mb-4 p-0 overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-[#E0E0E0]"
                onPress={() =>
                  setIsCardSectionCollapsed(!isCardSectionCollapsed)
                }
              >
                <Ionicons name="card-outline" size={22} color="#757575" />
                <Text className="ml-2 text-base font-semibold text-[#444] flex-1">
                  Thẻ Tín dụng/Ghi nợ
                </Text>
                <Ionicons
                  name={
                    isCardSectionCollapsed ? "chevron-forward" : "chevron-down"
                  }
                  size={20}
                  color="#757575"
                />
              </TouchableOpacity>
              {/* Card Display */}
              {!isCardSectionCollapsed && (
                <View className="px-4 py-3">
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : card ? (
                    <View className="flex-row items-center bg-[#F7F7F7] rounded-lg px-3 py-2 mb-3 border border-[#E0E0E0]">
                      <Text className="font-bold text-[#1A237E] mr-2">
                        {card.cardType}
                      </Text>
                      <Text className="text-[#444] flex-1">
                        {card.bankName} **** {card.last4}
                      </Text>
                      <Ionicons
                        name="radio-button-on"
                        size={20}
                        color="#4CAF50"
                      />
                    </View>
                  ) : (
                    <View className="items-center py-4">
                      <Text className="text-[#757575] text-sm">
                        Chưa có thẻ thanh toán nào
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate(
                        "payment/payment-insert-card" as never
                      );
                    }}
                    className="flex-row items-center border border-[#E0E0E0] rounded-lg px-3 py-2"
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#757575"
                    />
                    <Text className="ml-2 text-[#757575]">Thêm Thẻ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Internet Banking Option */}
            <TouchableOpacity className="bg-white rounded-2xl shadow-md flex-row items-center px-4 py-4 mb-4">
              <Ionicons name="business-outline" size={22} color="#757575" />
              <Text className="ml-2 text-base font-semibold text-[#444] flex-1">
                Internet Banking
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#757575" />
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View className="px-4 pb-6">
          <AppButton
            title={paymentLoading ? "Đang xử lý..." : "Thanh Toán"}
            onPress={handlePayButton}
            disabled={paymentLoading || !card || !selectedSubscription}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
