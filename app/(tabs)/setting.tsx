import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import ProfileHeader from "../../components/ProfileHeader";
import SettingsMenuItem from "../../components/SettingsMenuItem";
import SettingsSection from "../../components/SettingsSection";
import { getUserById } from "../../services/user";

interface User {
  id: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role?: string;
  userType?: string;
}

// Owner menu items - Main features
const OWNER_MAIN_ITEMS = [
  {
    id: "stadium-list",
    title: "Danh sách cụm sân",
    icon: "business-outline" as keyof typeof Ionicons.glyphMap,
    route: "/stadium-list/stadium-list",
    color: "#4CAF50",
  },
  {
    id: "staff-list",
    title: "Danh sách nhân viên",
    icon: "people-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#2196F3",
  },
  {
    id: "revenue-report",
    title: "Báo cáo doanh thu",
    icon: "bar-chart-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#9C27B0",
  },
];

// Owner menu items - App features
const OWNER_APP_ITEMS = [
  {
    id: "share-app",
    title: "Chia sẻ ứng dụng",
    icon: "share-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#607D8B",
  },
  {
    id: "terms",
    title: "Điều khoản và điều kiện",
    icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#795548",
  },
  {
    id: "about",
    title: "Về chúng tôi",
    icon: "information-circle-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#009688",
  },
  {
    id: "delete-account",
    title: "Xóa tài khoản",
    icon: "trash-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#F44336",
    isDestructive: true,
  },
  {
    id: "logout",
    title: "Đăng xuất",
    icon: "log-out-outline" as keyof typeof Ionicons.glyphMap,
    route: null,
    color: "#FF5722",
    isDestructive: true,
  },
];

export default function Setting() {
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
        const userId =
          typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
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

  // Determine if user is owner/stadium manager
  const isOwner = user?.role === "OWNER" || userProfile?.userType === "OWNER";

  const handleOwnerMenuPress = (
    item: (typeof OWNER_MAIN_ITEMS)[0] | (typeof OWNER_APP_ITEMS)[0]
  ) => {
    switch (item.id) {
      case "stadium-list":
        router.push("/stadium-list/stadium-list");
        break;
      case "staff-list":
        Alert.alert(
          "Thông báo",
          "Tính năng quản lý nhân viên sẽ được triển khai sớm!"
        );
        break;
      case "revenue-report":
        Alert.alert(
          "Thông báo",
          "Tính năng báo cáo doanh thu sẽ được triển khai sớm!"
        );
        break;
      case "share-app":
        handleShareApp();
        break;
      case "terms":
        Alert.alert(
          "Thông báo",
          "Điều khoản và điều kiện sẽ được cập nhật sớm!"
        );
        break;
      case "about":
        Alert.alert(
          "Về chúng tôi",
          "SportNow - Ứng dụng quản lý sân thể thao\nPhiên bản: 1.0.0"
        );
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

  const handleShareApp = () => {
    Alert.alert(
      "Chia sẻ ứng dụng",
      "Tính năng chia sẻ sẽ được triển khai sớm!"
    );
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
            Alert.alert(
              "Thông báo",
              "Tính năng xóa tài khoản sẽ được triển khai sớm!"
            );
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

  if (loading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#F9FAFB" />
        <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isOwner ? "#4CAF50" : "#5A983B"}
          />
          <Text className="text-gray-500 mt-4">Đang tải thông tin...</Text>
        </SafeAreaView>
      </>
    );
  }

  // Owner Settings UI (Using Customer Components)
  if (isOwner) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#F9FAFB" />
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Profile Header */}
          <ProfileHeader
            name={getUserDisplayName()}
            subtitle={getUserSubtitle()}
            onPress={() => {
              router.push("/profile/profile");
            }}
          />

          {/* Error message if profile fetch failed */}
          {error && (
            <View className="bg-red-50 mx-4 mt-4 p-3 rounded-lg border border-red-200">
              <Text className="text-red-700 text-sm text-center">{error}</Text>
            </View>
          )}

          <ScrollView
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Green Section - Owner Main Features */}
            <SettingsSection backgroundColor="#E8F5E8" marginBottom={16}>
              {OWNER_MAIN_ITEMS.map((item) => (
                <SettingsMenuItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  iconColor="#5A983B"
                  variant="customer"
                  onPress={() => handleOwnerMenuPress(item)}
                />
              ))}
            </SettingsSection>

            {/* White Section - App Features */}
            <SettingsSection backgroundColor="white" marginBottom={16}>
              {OWNER_APP_ITEMS.map((item) => (
                <SettingsMenuItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  iconColor={item.isDestructive ? "#EF4444" : "#6B7280"}
                  variant="customer"
                  isDestructive={item.isDestructive}
                  onPress={() => handleOwnerMenuPress(item)}
                  showArrow={item.id !== "logout"}
                />
              ))}
            </SettingsSection>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  // Customer Settings UI (Original Design)
  return (
    <>
      <StatusBar style="dark" backgroundColor="#F9FAFB" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <ProfileHeader
          name={getUserDisplayName()}
          subtitle={getUserSubtitle()}
          onPress={() => {
            router.push("/profile/profile");
          }}
        />

        {/* Error message if profile fetch failed */}
        {error && (
          <View className="bg-red-50 mx-4 mt-4 p-3 rounded-lg border border-red-200">
            <Text className="text-red-700 text-sm text-center">{error}</Text>
          </View>
        )}

        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Green Section - User Features */}
          <SettingsSection backgroundColor="#E8F5E8" marginBottom={16}>
            <SettingsMenuItem
              title="Lịch sử sự kiện của bạn"
              icon="calendar"
              iconColor="#5A983B"
              variant="customer"
              onPress={() => {
                Alert.alert(
                  "Thông báo",
                  "Tính năng lịch sử sự kiện sẽ được cập nhật sớm."
                );
              }}
            />
            <SettingsMenuItem
              title="Ưu đãi cho bạn"
              icon="gift"
              iconColor="#5A983B"
              variant="customer"
              onPress={() => {
                Alert.alert(
                  "Thông báo",
                  "Tính năng ưu đãi sẽ được cập nhật sớm."
                );
              }}
            />
            <SettingsMenuItem
              title="Tài khoản của bạn"
              icon="shield-checkmark"
              iconColor="#5A983B"
              variant="customer"
              onPress={() => {
                Alert.alert(
                  "Thông báo",
                  "Tính năng quản lý tài khoản sẽ được cập nhật sớm."
                );
              }}
            />
          </SettingsSection>

          {/* White Section - App Features */}
          <SettingsSection backgroundColor="white" marginBottom={16}>
            <SettingsMenuItem
              title="Điều khoản và điều kiện"
              icon="document-text"
              iconColor="#6B7280"
              variant="customer"
              onPress={() => {
                Alert.alert(
                  "Thông báo",
                  "Tính năng điều khoản sẽ được cập nhật sớm."
                );
              }}
            />
            <SettingsMenuItem
              title="Về chúng tôi"
              icon="information-circle"
              iconColor="#6B7280"
              variant="customer"
              onPress={() => {
                Alert.alert(
                  "Về chúng tôi",
                  "SportNow - Ứng dụng đặt sân thể thao\nPhiên bản: 1.0.0"
                );
              }}
            />
            <SettingsMenuItem
              title="Xóa tài khoản"
              icon="trash"
              iconColor="#EF4444"
              variant="customer"
              isDestructive={true}
              onPress={handleDeleteAccount}
            />
            <SettingsMenuItem
              title="Đăng xuất"
              icon="log-out"
              iconColor="#EF4444"
              variant="customer"
              isDestructive={true}
              onPress={handleLogout}
              showArrow={false}
            />
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
