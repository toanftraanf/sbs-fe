import BuyPremiumButton from "@/components/BuyPremiumButton";
import SubscriptionOption from "@/components/SubscriptionOption";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Subscription() {
  const { subscriptions, loading, error } = useSubscriptions();
  const { setSelectedSubscription } = useSubscription();
  const { user } = useAuth();
  const {
    userSubscription,
    loading: subscriptionLoading,
    handleCancelSubscription,
    formatDate,
    getRemainingDays,
  } = useUserSubscription();
  const [selected, setSelected] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (subscriptions.length > 0 && !selected) {
      setSelected(subscriptions[0].id);
    }
  }, [subscriptions, selected]);

  const selectedSubscription = subscriptions.find((s) => s.id === selected);

  // Show loading while fetching subscription details
  if (user?.hasSubscription && subscriptionLoading) {
    return (
      <LinearGradient
        colors={["#51576B", "#353D51"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: "#fff", marginTop: 16 }}>
            Đang tải thông tin subscription...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (user?.hasSubscription && userSubscription) {
    const remainingDays = getRemainingDays(userSubscription.endDate);

    return (
      <LinearGradient
        colors={["#51576B", "#353D51"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Back Button */}
            <TouchableOpacity className="mt-4" style={{ width: 40 }}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Success Icon */}
            <View className="items-center mt-4">
              <View className="bg-[#4CAF50] rounded-full p-4 mb-4">
                <Ionicons name="checkmark-circle" size={48} color="#fff" />
              </View>
            </View>

            {/* Title */}
            <View className="items-center mb-6">
              <Text className="text-white text-2xl font-bold">GÓI PREMIUM</Text>
              <Text className="text-[#4CAF50] text-lg font-semibold mt-2">
                Đang hoạt động
              </Text>
            </View>

            {/* Subscription Details Card */}
            <View className="bg-white/10 rounded-xl p-4 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-lg font-semibold">
                  {userSubscription.subscription?.name || "Gói Premium"}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    userSubscription.isCancelled
                      ? "bg-red-500"
                      : userSubscription.status === "ACTIVE"
                      ? "bg-[#4CAF50]"
                      : "bg-gray-500"
                  }`}
                >
                  <Text className="text-white text-xs font-medium">
                    {userSubscription.isCancelled
                      ? "Đã hủy"
                      : userSubscription.status}
                  </Text>
                </View>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">Ngày bắt đầu:</Text>
                  <Text className="text-white text-sm">
                    {formatDate(userSubscription.startDate)}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">Ngày kết thúc:</Text>
                  <Text className="text-white text-sm">
                    {formatDate(userSubscription.endDate)}
                  </Text>
                </View>

                {!userSubscription.isCancelled && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">Còn lại:</Text>
                    <Text className="text-white text-sm font-semibold">
                      {remainingDays} ngày
                    </Text>
                  </View>
                )}

                {userSubscription.subscription && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">Giá:</Text>
                    <Text className="text-white text-sm">
                      {userSubscription.subscription.price.toLocaleString()}{" "}
                      {userSubscription.subscription.currency}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Features List */}
            {userSubscription.subscription?.features && (
              <View className="mb-6">
                <Text className="text-white text-lg font-semibold mb-3">
                  Tính năng Premium:
                </Text>
                {userSubscription.subscription.features.map((feature, idx) => (
                  <View key={idx} className="flex-row items-start mb-3">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                      style={{ marginTop: 2 }}
                    />
                    <Text className="text-white text-sm ml-2 flex-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Cancel Button - Only show if not already cancelled */}
            {!userSubscription.isCancelled && (
              <TouchableOpacity
                onPress={handleCancelSubscription}
                className="bg-red-500 rounded-xl py-4 mb-6"
              >
                <Text className="text-white text-center font-semibold">
                  Hủy gói Premium
                </Text>
              </TouchableOpacity>
            )}

            {/* Cancelled Message */}
            {userSubscription.isCancelled && (
              <View className="bg-red-500/20 rounded-xl p-4 mb-6 border border-red-500/30">
                <Text className="text-red-300 text-center font-medium">
                  Gói Premium đã được hủy
                </Text>
                <Text className="text-red-300 text-center text-sm mt-1">
                  Bạn sẽ mất quyền truy cập Premium khi gói hết hạn
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#51576B", "#353D51"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Back Button */}
            <TouchableOpacity className="mt-4" style={{ width: 40 }}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Trophy Icon */}
            <View className="items-center mt-2">
              <View className="bg-[#FFD36A] rounded-full p-4 mb-2">
                <Ionicons name="trophy" size={36} color="#fff" />
              </View>
            </View>

            {/* Title & Subtitle */}
            <View className="items-center mb-6">
              <Text className="text-white text-2xl font-bold">GÓI PREMIUM</Text>
              <Text className="text-[#E0E0E0] text-xs mt-1 text-center">
                Mở khóa tất cả các đặc quyền và{"\n"}loại bỏ quảng cáo
              </Text>
            </View>

            {/* Subscription Options */}
            <View className="mb-6">
              {subscriptions.map((sub) => (
                <SubscriptionOption
                  key={sub.id}
                  period={sub.durationMonths}
                  label={sub.durationMonths === 1 ? "Tháng" : "Tháng"}
                  subtitle={sub.description || "Tổng giá 12 tháng -"}
                  price={`${sub.price.toLocaleString()} ${sub.currency}`}
                  selected={selected === sub.id}
                  onPress={() => setSelected(sub.id)}
                />
              ))}
            </View>

            {/* Features List */}
            <View className="mb-8 px-2">
              {selectedSubscription?.features.map((feature, idx) => (
                <View key={idx} className="flex-row items-start mb-3">
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#FFD36A"
                    style={{ marginTop: 2 }}
                  />
                  <Text className="text-white text-sm ml-2 flex-1">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <BuyPremiumButton
          onPress={() => {
            if (selectedSubscription) {
              setSelectedSubscription(selectedSubscription);
              navigation.navigate("payment/payment-method" as never);
            }
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
