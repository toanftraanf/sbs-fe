import ProfileHeader from "@/components/ProfileHeader";
import SettingsMenuItem from "@/components/SettingsMenuItem";
import SettingsSection from "@/components/SettingsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, SafeAreaView, ScrollView } from "react-native";

const Setting = () => {
  const { user, logout } = useAuth();
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
    if (user?.phoneNumber) {
      // Format phone number for display
      return `User ${user.phoneNumber.slice(-4)}`;
    }
    return "Nguyễn Văn A";
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F9FAFB" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <ProfileHeader
          name={getUserDisplayName()}
          subtitle="Profile của bạn"
          onPress={() => {
            // TODO: Navigate to profile edit screen
            Alert.alert(
              "Thông báo",
              "Tính năng chỉnh sửa profile sẽ được cập nhật sớm."
            );
          }}
        />

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
