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
import { OWNER_APP_ITEMS, OWNER_MAIN_ITEMS } from "../../types/settings";

export default function Setting() {
  const {
    user,
    userProfile,
    loading,
    error,
    isOwner,
    handleOwnerMenuPress,
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

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F9FAFB" />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView>
          <ProfileHeader
            name={getUserDisplayName()}
            subtitle={getUserSubtitle()}
            avatarUrl={userProfile?.avatar?.url}
          />
          <View style={{ marginHorizontal: 16, marginTop: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Tính năng chính
            </Text>
            <SettingsSection>
              {OWNER_MAIN_ITEMS.map((item) => (
                <SettingsMenuItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  isDestructive={item.isDestructive}
                  onPress={() => handleOwnerMenuPress(item)}
                />
              ))}
            </SettingsSection>
            <Text
              style={{ fontWeight: "bold", fontSize: 16, marginVertical: 16 }}
            >
              Ứng dụng
            </Text>
            <SettingsSection>
              {OWNER_APP_ITEMS.map((item) => (
                <SettingsMenuItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  isDestructive={item.isDestructive}
                  onPress={() => handleOwnerMenuPress(item)}
                />
              ))}
            </SettingsSection>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
