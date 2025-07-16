import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/services/card";
import { createUserSubscription, Subscription } from "@/services/subscription";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export function usePayment() {
  const { user, refetchUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (selectedCard: Card | null, subscriptionPlan: Subscription) => {
    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thanh toán");
      return;
    }

    if (!selectedCard) {
      Alert.alert("Lỗi", "Vui lòng chọn thẻ thanh toán");
      return;
    }

    if (!subscriptionPlan) {
      Alert.alert("Lỗi", "Vui lòng chọn gói subscription");
      return;
    }

    setLoading(true);
    try {
      // Calculate subscription dates based on the plan's durationMonths
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + subscriptionPlan.durationMonths);

      const userSubscription = await createUserSubscription({
        userId: parseInt(user.id),
        subscriptionId: parseInt(subscriptionPlan.id),
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        status: "ACTIVE",
        cardId: parseInt(selectedCard.id),
      });

      console.log("User subscription created:", userSubscription);
      await refetchUser();
      
      router.push("payment/payment-success");
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Thanh toán thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    handlePayment,
    loading,
  };
} 