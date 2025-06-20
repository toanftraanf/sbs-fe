import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import ProfileHeader from "../../components/ProfileHeader";
import SettingsMenuItem from "../../components/SettingsMenuItem";
import SettingsSection from "../../components/SettingsSection";
import useSetting from "../../hooks/useSetting";
import {
  CUSTOMER_APP_ITEMS,
  CUSTOMER_MAIN_ITEMS,
  OWNER_APP_ITEMS,
  OWNER_MAIN_ITEMS,
} from "../../types/settings";

export default function Setting() {
  const {
    user,
    userProfile,
    loading,
    error,
    isOwner,
    handleOwnerMenuPress,
    handleCustomerMenuPress,
    getUserDisplayName,
    getUserSubtitle,
  } = useSetting();

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

  // Owner Settings UI
  if (isOwner) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#F9FAFB" />
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Profile Header */}
          <ProfileHeader
            name={getUserDisplayName()}
            subtitle={getUserSubtitle()}
            avatarUrl={userProfile?.avatar?.url}
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
          avatarUrl={userProfile?.avatar?.url}
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
            {CUSTOMER_MAIN_ITEMS.map((item) => (
              <SettingsMenuItem
                key={item.id}
                title={item.title}
                icon={item.icon}
                iconColor={item.iconColor}
                variant="customer"
                onPress={() => handleCustomerMenuPress(item.id)}
              />
            ))}
          </SettingsSection>

          {/* White Section - App Features */}
          <SettingsSection backgroundColor="white" marginBottom={16}>
            {CUSTOMER_APP_ITEMS.map((item) => (
              <SettingsMenuItem
                key={item.id}
                title={item.title}
                icon={item.icon}
                iconColor={item.iconColor}
                variant="customer"
                isDestructive={item.isDestructive}
                onPress={() => handleCustomerMenuPress(item.id)}
                showArrow={item.id !== "logout"}
              />
            ))}
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
