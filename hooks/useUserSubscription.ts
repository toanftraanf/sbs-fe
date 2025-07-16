import { apolloClient } from "@/config/apollo";
import { useAuth } from "@/contexts/AuthContext";
import { cancelUserSubscription, getUserSubscription, UserSubscriptionDetails } from "@/services/subscription";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useUserSubscription() {
  const { user, refetchUser } = useAuth();
  const [userSubscription, setUserSubscription] = useState<UserSubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user?.hasSubscription) {
      fetchUserSubscription();
    } else {
      // If user doesn't have subscription, set loading to false immediately
      setLoading(false);
      setUserSubscription(null);
    }
  }, [user?.id, user?.hasSubscription]);

  const fetchUserSubscription = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log("[useUserSubscription] Fetching subscription for user ID:", user.id);
      const subscription = await getUserSubscription(parseInt(user.id));
      console.log("[useUserSubscription] Subscription result:", subscription);
      setUserSubscription(subscription);
    } catch (err) {
      console.error("Error fetching user subscription:", err);
      // Clear Apollo cache for subscription queries to prevent stale data
      try {
        await apolloClient.clearStore();
        console.log("[useUserSubscription] Cleared Apollo cache due to subscription error");
      } catch (cacheError) {
        console.error("Error clearing Apollo cache:", cacheError);
      }
      // Don't set error for missing subscription, just set to null
      setUserSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }

    Alert.alert(
      "Hủy gói Premium",
      "Bạn có chắc chắn muốn hủy gói Premium? Bạn sẽ mất quyền truy cập vào các tính năng Premium sau khi hủy.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Hủy gói",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelUserSubscription(parseInt(user.id));
              Alert.alert("Thành công", "Đã hủy gói Premium thành công");
              // Refetch user data to update hasSubscription status
              await refetchUser();
              // Refetch subscription data
              await fetchUserSubscription();
            } catch (err) {
              console.error("Error canceling subscription:", err);
              Alert.alert("Lỗi", "Không thể hủy gói Premium. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return {
    userSubscription,
    loading,
    error,
    handleCancelSubscription,
    formatDate,
    getRemainingDays,
    refetch: fetchUserSubscription,
  };
} 