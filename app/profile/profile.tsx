import { gql, useApolloClient } from "@apollo/client";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ImagePickerModal from "@/components/ImagePickerModal";
import PremiumPackageCard from "@/components/PremiumPackageCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { uploadAvatar } from "@/services/fileUpload";

// Mutation để cập nhật avatar URL trong profile
const UPDATE_PROFILE_AVATAR = gql`
  mutation UpdateUserAvatar($input: UpdateUserAvatarInput!) {
    updateUserAvatar(input: $input) {
      id
      avatarUrl
    }
  }
`;

export default function ProfileScreen() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const apolloClient = useApolloClient();

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = React.useState(false);

  React.useEffect(() => {
    if (profile?.avatarUrl) {
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile?.avatarUrl]);

  React.useEffect(() => {
    console.log("🔍 Profile Screen Debug:", { user, profile });
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

  const getDisplayEmail = () => {
    if (profile?.email?.trim()) return profile.email;
    if (user?.email?.trim()) return user.email;
    return null;
  };
  const hasEmail = () => getDisplayEmail() !== null;

  const getDisplayName = () => {
    if (profile?.fullName?.trim()) return profile.fullName;
    if (user?.fullName?.trim()) return user.fullName;
    if (user?.phoneNumber) return user.phoneNumber;
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
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => setShowImagePicker(true)}
              className="w-20 h-20 rounded-full bg-primary items-center justify-center mr-4 overflow-hidden"
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : getDisplayName() ? (
                <Text className="text-2xl font-bold text-white">
                  {getDisplayName().charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {getDisplayName()}
              </Text>
              <TouchableOpacity
                onPress={() => !hasEmail() && console.log("Add email pressed")}
                disabled={hasEmail()}
              >
                <Text
                  className={`${
                    hasEmail() ? "text-gray-600" : "text-primary"
                  }`}
                >
                  {hasEmail() ? getDisplayEmail() : "Thêm email"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700 font-medium">Email</Text>
            {hasEmail() ? (
              <Text className="text-gray-900" numberOfLines={1}>
                {getDisplayEmail()}
              </Text>
            ) : (
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-gray-500 mr-2">Chưa có email</Text>
                <Ionicons name="add-circle-outline" size={20} color="#7CB518" />
              </TouchableOpacity>
            )}
          </View>

          {/* Phone */}
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
                name={profile?.sex?.toLowerCase() === "male" ? "male" : "female"}
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
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-700 font-medium">Trận đấu</Text>
              <Text className="text-2xl font-bold text-gray-900">5</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 font-medium mb-1">Hoạt động</Text>
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
              "Chơi rất tốt và fair play. Recommend!"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal chọn ảnh và upload */}
       <ImagePickerModal
        visible={showImagePicker}
        title="Chọn ảnh đại diện"
        folder="avatars"
        allowsEditing
        compressionOptions={{ maxWidth: 512, maxHeight: 512, quality: 0.9 }}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={async (uri: string) => {
          setShowImagePicker(false);
           try {
        const uploadedUrl = await uploadAvatar(apolloClient, uri);

        const { data } = await apolloClient.mutate<{
          updateUserAvatar: { id: number; avatarUrl: string };
        }>({
          mutation: UPDATE_PROFILE_AVATAR,
          variables: {
            input: {
              id: user?.id,
              avatarUrl: uploadedUrl,
            },
          },
        });

        if (data?.updateUserAvatar.avatarUrl) {
          setAvatarUrl(data.updateUserAvatar.avatarUrl);
        }
      } catch (err) {
        console.error("❌ Error updating avatar:", err);
        Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
      }
        }}
      />
    </View>
  );
}
