import PremiumPackageCard from "@/components/PremiumPackageCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();

  // Debug logging to understand the data structure
  React.useEffect(() => {
    console.log("🔍 Profile Screen Debug:");
    console.log("  📱 User from context:", {
      id: user?.id,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
      fullName: user?.fullName,
      role: user?.role,
    });
    console.log("  👤 Profile from API:", {
      id: profile?.id,
      phoneNumber: profile?.phoneNumber,
      email: profile?.email,
      fullName: profile?.fullName,
      role: profile?.role,
    });
  }, [user, profile]);

  const formatAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "Chưa cập nhật";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} tuổi`;
  };

  const getGenderText = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      default:
        return "Chưa cập nhật";
    }
  };

  // Helper function to get the best available email
  const getDisplayEmail = () => {
    if (profile?.email && profile.email.trim()) {
      return profile.email;
    }
    if (user?.email && user.email.trim()) {
      return user.email;
    }
    return null; // Return null so we can handle it separately
  };

  // Helper function to check if email exists
  const hasEmail = () => {
    const email = getDisplayEmail();
    return email !== null;
  };

  // Helper function to get the best available name
  const getDisplayName = () => {
    if (profile?.fullName && profile.fullName.trim()) {
      return profile.fullName;
    }
    if (user?.fullName && user.fullName.trim()) {
      return user.fullName;
    }
    if (user?.phoneNumber) {
      return user.phoneNumber;
    }
    return "Người dùng";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#5A983B" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-900">Tài khoản</Text>

        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="create-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Avatar and Basic Info */}
          <View className="flex-row items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mr-4">
              {getDisplayName() ? (
                <Text className="text-2xl font-bold text-white">
                  {getDisplayName().charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
            </View>

            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {getDisplayName()}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (!hasEmail()) {
                    // Navigate to edit profile or show add email modal
                    console.log("Add email pressed");
                    // TODO: Navigate to profile edit screen
                  }
                }}
                disabled={hasEmail()}
              >
                <Text
                  className={`${hasEmail() ? "text-gray-600" : "text-primary"}`}
                >
                  {hasEmail() ? getDisplayEmail() : "Thêm email"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Section - Separate display */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700 font-medium">Email</Text>
            <View className="flex-row items-center">
              {hasEmail() ? (
                <Text className="text-gray-900" numberOfLines={1}>
                  {getDisplayEmail()}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    console.log("Add email from detail section pressed");
                    // TODO: Navigate to profile edit screen or show email input modal
                  }}
                  className="flex-row items-center"
                >
                  <Text className="text-gray-500 mr-2">Chưa có email</Text>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#7CB518"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Phone Section */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700 font-medium">Số điện thoại</Text>
            <Text className="text-gray-900">
              {user?.phoneNumber || profile?.phoneNumber || "Chưa cập nhật"}
            </Text>
          </View>

          {/* Age */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700 font-medium">Độ tuổi</Text>
            <Text className="text-gray-900">{formatAge(profile?.dob)}</Text>
          </View>

          {/* Gender */}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-gray-700 font-medium">Giới tính</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={
                  profile?.sex?.toLowerCase() === "male" ? "male" : "female"
                }
                size={16}
                color="#666"
                className="mr-1"
              />
              <Text className="text-gray-900 ml-1">
                {getGenderText(profile?.sex)}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Package */}
        <PremiumPackageCard className="mx-4 mt-4" />

        {/* Sports Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Thể thao</Text>

          <View className="flex-row flex-wrap">
            <View className="bg-primary rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-white font-medium">Cầu lông</Text>
            </View>
            <View className="bg-gray-200 rounded-full px-4 py-2 mr-2 mb-2">
              <Text className="text-gray-700 font-medium">Bóng bàn</Text>
            </View>
          </View>

          {/* Stats */}
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-700 font-medium">Trận đấu</Text>
              <Text className="text-2xl font-bold text-gray-900">5</Text>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 font-medium mb-1">
                  Hoạt động
                </Text>
                <Text className="text-sm text-gray-600">Tích cực</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-700 font-medium mb-1">Tích cực</Text>
                <Text className="text-sm text-gray-600">Cao</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Huy hiệu</Text>

          <View className="flex-row space-x-4">
            <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
              <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
            </View>
            <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
              <MaterialIcons name="star" size={24} color="#C0C0C0" />
            </View>
            <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
              <MaterialIcons
                name="local-fire-department"
                size={24}
                color="#FF6B35"
              />
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Đánh giá</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Sample Review */}
          <View className="border-l-4 border-primary pl-4">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-3">
                <Text className="text-xs font-bold text-gray-600">N</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Nguyễn Thị B</Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text className="text-gray-600 text-sm">
              &quot;Chơi rất tốt và fair play. Recommend!&quot;
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
