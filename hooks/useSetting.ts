import { useAuth } from "@/contexts/AuthContext";
import { getUserById } from "@/services/user";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

interface User {
  id: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  userType?: string;
  avatar?: {
    id: string;
    url: string;
  };
}

export default function useSetting() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      if (user?.id) {
        const userId = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
        const profileData = await getUserById(userId);
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Không thể tải thông tin profile. Hiển thị thông tin cơ bản.");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user?.role === "OWNER" || userProfile?.userType === "OWNER";

  const handleOwnerMenuPress = (item: any) => {
    switch (item.id) {
      case "stadium-list":
        router.push("/stadium-list/stadium-list");
        break;
      case "staff-list":
        Alert.alert("Thông báo", "Tính năng quản lý nhân viên sẽ được triển khai sớm!");
        break;
      case "revenue-report":
        Alert.alert("Thông báo", "Tính năng báo cáo doanh thu sẽ được triển khai sớm!");
        break;
      case "share-app":
        handleShareApp();
        break;
      case "terms":
        Alert.alert("Thông báo", "Điều khoản và điều kiện sẽ được cập nhật sớm!");
        break;
      case "about":
        Alert.alert("Về chúng tôi", "SportNow - Ứng dụng quản lý sân thể thao\nPhiên bản: 1.0.0");
        break;
      case "delete-account":
        handleDeleteAccount();
        break;
      case "logout":
        handleLogout();
        break;
      default:
        if (item.route) {
          router.push(item.route as any);
        }
    }
  };

  const handleCustomerMenuPress = (itemId: string) => {
    switch (itemId) {
      case "booking-history":
        router.push("/stadium-booking/booking-history");
        break;
      case "event-history":
        Alert.alert("Thông báo", "Tính năng lịch sử sự kiện sẽ được cập nhật sớm.");
        break;
      case "promotions":
        Alert.alert("Thông báo", "Tính năng ưu đãi sẽ được cập nhật sớm.");
        break;
      case "account-management":
        Alert.alert("Thông báo", "Tính năng quản lý tài khoản sẽ được cập nhật sớm.");
        break;
      case "terms":
        Alert.alert("Thông báo", "Tính năng điều khoản sẽ được cập nhật sớm.");
        break;
      case "about":
        Alert.alert("Về chúng tôi", "SportNow - Ứng dụng đặt sân thể thao\nPhiên bản: 1.0.0");
        break;
      case "delete-account":
        handleDeleteAccount();
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  const handleShareApp = () => {
    Alert.alert("Chia sẻ ứng dụng", "Tính năng chia sẻ sẽ được triển khai sớm!");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xóa tài khoản",
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            Alert.alert("Thông báo", "Tính năng xóa tài khoản sẽ được triển khai sớm!");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const getUserDisplayName = () => {
    if (userProfile?.fullName) {
      return userProfile.fullName;
    }
    if (userProfile?.phoneNumber) {
      return `User ${userProfile.phoneNumber.slice(-4)}`;
    }
    return isOwner ? "Chủ sân" : "Người dùng";
  };

  const getUserSubtitle = () => {
    if (userProfile?.email) {
      return userProfile.email;
    }
    if (userProfile?.phoneNumber) {
      return userProfile.phoneNumber;
    }
    return isOwner ? "Quản lý sân thể thao" : "Profile của bạn";
  };

  return {
    user,
    userProfile,
    loading,
    error,
    isOwner,
    handleOwnerMenuPress,
    handleCustomerMenuPress,
    handleShareApp,
    handleDeleteAccount,
    handleLogout,
    getUserDisplayName,
    getUserSubtitle,
  };
} 