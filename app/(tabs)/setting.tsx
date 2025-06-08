import ProfileHeader from "@/components/ProfileHeader";
import SettingsMenuItem from "@/components/SettingsMenuItem";
import SettingsSection from "@/components/SettingsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

const Setting = () => {
  const { logout } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/onboarding");
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert(
              "Lỗi đăng xuất",
              "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
              [{ text: "OK" }]
            );
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xác nhận xóa tài khoản",
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa tài khoản",
          style: "destructive",
          onPress: () => {
            // TODO: Implement delete account functionality
            Alert.alert(
              "Thông báo",
              "Tính năng xóa tài khoản sẽ được cập nhật sớm."
            );
          },
        },
      ]
    );
  };

  const getUserDisplayName = () => {
    if (profile?.fullName) {
      return profile.fullName;
    }
    if (profile?.phoneNumber) {
      // Format phone number for display
      return `User ${profile.phoneNumber.slice(-4)}`;
    }
    return "Người dùng";
  };

  const getUserSubtitle = () => {
    if (profile?.email) {
      return profile.email;
    }
    if (profile?.phoneNumber) {
      return profile.phoneNumber;
    }
    return "Profile của bạn";
  };

  // Loading state
  if (loading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#F9FAFB" />
        <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
          <ActivityIndicator size="large" color="#5A983B" />
          <Text className="mt-4 text-gray-600">Đang tải thông tin...</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F9FAFB" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <ProfileHeader
          name={getUserDisplayName()}
          subtitle={getUserSubtitle()}
          onPress={() => {
            // TODO: Navigate to profile edit screen
            Alert.alert(
              "Thông báo",
              "Tính năng chỉnh sửa profile sẽ được cập nhật sớm."
            );
          }}
        />

        {/* Error message if profile fetch failed */}
        {error && (
          <View className="bg-red-50 mx-4 mt-4 p-3 rounded-lg border border-red-200">
            <Text className="text-red-700 text-sm text-center">
              Không thể tải thông tin profile. Hiển thị thông tin cơ bản.
            </Text>
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
              onPress={() => {
                Alert.alert(
                  "Thông báo",
                  "Tính năng về chúng tôi sẽ được cập nhật sớm."
                );
              }}
            />
            <SettingsMenuItem
              title="Xóa tài khoản"
              icon="trash"
              iconColor="#EF4444"
              onPress={handleDeleteAccount}
            />
            <SettingsMenuItem
              title="Đăng xuất"
              icon="log-out"
              iconColor="#EF4444"
              onPress={handleLogout}
              showArrow={false}
            />
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Setting;
