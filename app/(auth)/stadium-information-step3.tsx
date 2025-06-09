import { useAuth } from "@/contexts/AuthContext";
import { useApolloClient } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import ImagePickerModal from "../../components/ImagePickerModal";
import SportNowHeader from "../../components/SportNowHeader";
import { CREATE_STADIUM_WITH_STEPS } from "../../graphql";
import { UploadProgress as UploadProgressType } from "../../services/fileUpload";

const TABS = [
  { key: "avatar", label: "Ảnh đại diện", icon: "person-circle" },
  { key: "banner", label: "Ảnh banner", icon: "image" },
  { key: "stadium", label: "Ảnh sân tập", icon: "images" },
];

interface ImageState {
  url: string;
  uploading: boolean;
  progress: UploadProgressType | null;
}

export default function StadiumInformationStep3() {
  const [activeTab, setActiveTab] = useState("avatar");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { step1Data, step2Data, stadiumId } = useLocalSearchParams();
  const { user } = useAuth();
  const apolloClient = useApolloClient();

  // Image states - now storing direct URLs
  const [avatarImage, setAvatarImage] = useState<ImageState | null>(null);
  const [bannerImage, setBannerImage] = useState<ImageState | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageState[]>([]);

  // General states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Parse step data
  const parsedStep1Data = step1Data ? JSON.parse(step1Data as string) : null;
  const parsedStep2Data = step2Data ? JSON.parse(step2Data as string) : null;

  console.log("Step 3 - Received data:", {
    step1Data: parsedStep1Data,
    step2Data: parsedStep2Data,
    stadiumId,
    userId: user?.id,
  });

  const validateImages = () => {
    const newErrors: { [key: string]: string } = {};

    if (!avatarImage?.url) {
      newErrors.avatar = "Vui lòng chọn ảnh đại diện";
    }

    if (!bannerImage?.url) {
      newErrors.banner = "Vui lòng chọn ảnh banner";
    }

    if (galleryImages.filter((img) => img.url).length === 0) {
      newErrors.stadium = "Vui lòng chọn ít nhất một ảnh sân tập";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUploaded = (imageUrl: string) => {
    console.log("Image uploaded successfully:", imageUrl);

    if (activeTab === "avatar") {
      setAvatarImage({ url: imageUrl, uploading: false, progress: null });
      // Clear error if exists
      if (errors.avatar) {
        const newErrors = { ...errors };
        delete newErrors.avatar;
        setErrors(newErrors);
      }
    } else if (activeTab === "banner") {
      setBannerImage({ url: imageUrl, uploading: false, progress: null });
      // Clear error if exists
      if (errors.banner) {
        const newErrors = { ...errors };
        delete newErrors.banner;
        setErrors(newErrors);
      }
    } else if (activeTab === "stadium") {
      setGalleryImages((prev) => [
        ...prev,
        { url: imageUrl, uploading: false, progress: null },
      ]);
      // Clear error if exists
      if (errors.stadium) {
        const newErrors = { ...errors };
        delete newErrors.stadium;
        setErrors(newErrors);
      }
    }
  };

  const removeAvatarImage = () => {
    setAvatarImage(null);
    setShowImagePicker(true);
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    setShowImagePicker(true);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (submitting) return;

    if (!validateImages()) {
      const firstError = Object.values(errors)[0];
      Alert.alert("Thông báo", firstError);
      return;
    }

    if (!user?.id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    setSubmitting(true);

    try {
      console.log("🚀 Creating stadium...");

      // Prepare step1Data (without images - they're handled separately)
      const step1DataClean = {
        ...parsedStep1Data,
        // Ensure arrays are properly formatted
        otherContacts:
          parsedStep1Data.otherContacts?.filter(
            (contact: string) => contact && contact.trim() !== ""
          ) || [],
      };

      // Validate required fields
      if (!step1DataClean.name || step1DataClean.name.trim() === "") {
        throw new Error("Tên sân không được để trống");
      }
      if (!step1DataClean.phone || step1DataClean.phone.trim() === "") {
        throw new Error("Số điện thoại không được để trống");
      }
      if (!step1DataClean.email || step1DataClean.email.trim() === "") {
        throw new Error("Email không được để trống");
      }
      if (!step1DataClean.googleMap || step1DataClean.googleMap.trim() === "") {
        throw new Error("Link Google Map không được để trống");
      }
      if (!step1DataClean.startTime || !step1DataClean.endTime) {
        throw new Error("Giờ mở cửa và đóng cửa không được để trống");
      }
      if (!step1DataClean.sports || step1DataClean.sports.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một môn thể thao");
      }
      if (!parsedStep2Data.bank || parsedStep2Data.bank.trim() === "") {
        throw new Error("Thông tin ngân hàng không được để trống");
      }
      if (
        !parsedStep2Data.accountName ||
        parsedStep2Data.accountName.trim() === ""
      ) {
        throw new Error("Tên tài khoản ngân hàng không được để trống");
      }
      if (
        !parsedStep2Data.accountNumber ||
        parsedStep2Data.accountNumber.trim() === ""
      ) {
        throw new Error("Số tài khoản ngân hàng không được để trống");
      }

      // Create the input object matching backend schema
      const createStadiumStepsInput = {
        userId: typeof user.id === "string" ? parseInt(user.id, 10) : user.id,
        stadiumId: stadiumId ? parseInt(stadiumId as string) : undefined,
        step1Data: step1DataClean,
        step2Data: parsedStep2Data,
        avatarUrl: avatarImage?.url || null,
        bannerUrl: bannerImage?.url || null,
        galleryUrls: galleryImages.map((img) => img.url).filter(Boolean),
      };

      // Call the GraphQL mutation
      const { data, errors: gqlErrors } = await apolloClient.mutate({
        mutation: CREATE_STADIUM_WITH_STEPS,
        variables: {
          createStadiumStepsInput,
        },
        errorPolicy: "all",
      });

      if (gqlErrors) {
        console.error("❌ GraphQL Errors:", gqlErrors);
        console.error(
          "❌ Full GraphQL Error Details:",
          JSON.stringify(gqlErrors, null, 2)
        );
        throw new Error(
          gqlErrors[0]?.message || "Có lỗi xảy ra khi tạo sân tập"
        );
      }

      if (!data?.createStadiumWithSteps) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      const createdStadium = data.createStadiumWithSteps;
      console.log("✅ Stadium created successfully:", createdStadium);

      Alert.alert(
        "🎉 Thành công!",
        `Sân tập "${createdStadium.name}" đã được tạo thành công!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to stadium list
              router.replace("/stadium-list/stadium-list");
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Stadium creation failed:", error);

      // Log the full error for debugging
      if (error && typeof error === "object") {
        console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));

        // Check for network/GraphQL specific errors
        const apolloError = error as any;
        if (apolloError.networkError) {
          console.error("❌ Network Error:", apolloError.networkError);
          if (apolloError.networkError.result) {
            console.error(
              "❌ Network Error Result:",
              JSON.stringify(apolloError.networkError.result, null, 2)
            );
          }
        }
        if (apolloError.graphQLErrors) {
          console.error(
            "❌ GraphQL Errors from Apollo:",
            apolloError.graphQLErrors
          );
        }
      }

      let errorMessage = "Có lỗi xảy ra khi tạo sân tập. Vui lòng thử lại.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert("Lỗi", errorMessage, [{ text: "OK" }]);
    } finally {
      setSubmitting(false);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "avatar":
        return "Chọn ảnh đại diện";
      case "banner":
        return "Chọn ảnh banner";
      case "stadium":
        return "Chọn ảnh sân tập";
      default:
        return "Chọn ảnh";
    }
  };

  const getFolder = () => {
    switch (activeTab) {
      case "avatar":
        return "avatars";
      case "banner":
        return "banners";
      case "stadium":
        return "galleries";
      default:
        return "uploads";
    }
  };

  const getCompressionOptions = () => {
    switch (activeTab) {
      case "avatar":
        return { maxWidth: 512, maxHeight: 512, quality: 0.9 };
      case "banner":
        return { maxWidth: 1920, maxHeight: 1080, quality: 0.9 };
      case "stadium":
        return { maxWidth: 1440, maxHeight: 1440, quality: 0.8 };
      default:
        return { maxWidth: 1920, maxHeight: 1920, quality: 0.8 };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SportNowHeader title="Thông tin sân tập - Bước 3" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-center text-gray-700 mb-6 mt-2">
          Tải lên hình ảnh cho sân tập của bạn
        </Text>

        {/* Tabs */}
        <View className="flex-row mb-6">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 items-center pb-3 border-b-2 ${
                activeTab === tab.key ? "border-[#7CB518]" : "border-gray-200"
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={activeTab === tab.key ? "#7CB518" : "#B0B0B0"}
              />
              <Text
                className={`mt-1 font-InterMedium text-sm ${
                  activeTab === tab.key ? "text-[#7CB518]" : "text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
              {errors[tab.key] && (
                <View className="w-2 h-2 bg-red-500 rounded-full mt-1" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Avatar Tab Content */}
        {activeTab === "avatar" && (
          <View className="items-center mb-6">
            {avatarImage?.url ? (
              <View className="items-center">
                <View className="relative">
                  <Image
                    source={{ uri: avatarImage.url }}
                    className="w-32 h-32 rounded-full"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={removeAvatarImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center shadow-lg"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-green-600 font-InterMedium mt-3">
                  ✅ Đã tải lên thành công
                </Text>
                <TouchableOpacity
                  onPress={removeAvatarImage}
                  className="flex-row items-center bg-[#7CB518] px-4 py-2 rounded-xl mt-2"
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text className="ml-2 text-white font-InterMedium">
                    Thay đổi ảnh
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowImagePicker(true)}
                className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300"
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={32} color="#7CB518" />
                <Text className="text-gray-600 mt-2 text-center font-InterMedium">
                  Chọn ảnh{"\n"}đại diện
                </Text>
              </TouchableOpacity>
            )}
            {errors.avatar && (
              <Text className="text-red-500 text-sm mt-3 text-center">
                {errors.avatar}
              </Text>
            )}
          </View>
        )}

        {/* Banner Tab Content */}
        {activeTab === "banner" && (
          <View className="mb-6">
            {bannerImage?.url ? (
              <View>
                <View className="relative">
                  <Image
                    source={{ uri: bannerImage.url }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={removeBannerImage}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full items-center justify-center shadow-lg"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-green-600 font-InterMedium mt-3 text-center">
                  ✅ Đã tải lên thành công
                </Text>
                <TouchableOpacity
                  onPress={removeBannerImage}
                  className="flex-row items-center justify-center bg-[#7CB518] px-4 py-2 rounded-xl mt-3"
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text className="ml-2 text-white font-InterMedium">
                    Thay đổi ảnh
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowImagePicker(true)}
                className="w-full h-48 rounded-xl bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300"
                activeOpacity={0.7}
              >
                <Ionicons name="image" size={48} color="#7CB518" />
                <Text className="text-gray-600 mt-2 text-center font-InterMedium">
                  Chọn ảnh banner
                </Text>
              </TouchableOpacity>
            )}
            {errors.banner && (
              <Text className="text-red-500 text-sm mt-3 text-center">
                {errors.banner}
              </Text>
            )}
          </View>
        )}

        {/* Stadium Gallery Tab Content */}
        {activeTab === "stadium" && (
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => setShowImagePicker(true)}
              className="flex-row items-center bg-[#7CB518] px-4 py-3 rounded-xl mb-4"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="ml-2 text-white font-InterMedium">
                Thêm ảnh sân tập
              </Text>
            </TouchableOpacity>

            {galleryImages.length > 0 && (
              <View>
                <Text className="font-InterSemiBold text-gray-800 mb-3">
                  Ảnh đã tải lên (
                  {galleryImages.filter((img) => img.url).length})
                </Text>
                <View className="flex-row flex-wrap">
                  {galleryImages.map((image, index) => (
                    <View key={index} className="w-1/3 p-1">
                      <View className="relative">
                        <Image
                          source={{ uri: image.url }}
                          className="w-full aspect-square rounded-lg"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center shadow-lg"
                        >
                          <Ionicons name="close" size={12} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {errors.stadium && (
              <Text className="text-red-500 text-sm mt-3 text-center">
                {errors.stadium}
              </Text>
            )}
          </View>
        )}

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-8 mb-8">
          <AppButton
            style={{ width: "48%" }}
            title="Quay lại"
            filled={false}
            onPress={() => router.back()}
          />
          <AppButton
            style={{ width: "48%" }}
            title={submitting ? "Đang tạo sân..." : "Hoàn thành"}
            filled
            onPress={handleComplete}
            disabled={submitting}
          />
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageUploaded}
        folder={getFolder()}
        title={getTabTitle()}
        allowsEditing={activeTab !== "stadium"}
        compressionOptions={getCompressionOptions()}
      />
    </KeyboardAvoidingView>
  );
}
