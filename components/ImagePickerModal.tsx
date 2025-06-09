import { useApolloClient } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  captureImage,
  FileData,
  pickImage,
  uploadImage,
  UploadProgress,
} from "../services/fileUpload";

const { width } = Dimensions.get("window");

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUrl: string) => void;
  folder?: string;
  title?: string;
  allowsEditing?: boolean;
  compressionOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

export default function ImagePickerModal({
  visible,
  onClose,
  onImageSelected,
  folder = "uploads",
  title = "Chọn ảnh",
  allowsEditing = true,
  compressionOptions,
}: ImagePickerModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const apolloClient = useApolloClient();

  const handleImageUpload = async (fileData: FileData) => {
    try {
      setUploading(true);
      setUploadProgress({ loaded: 0, total: 100, percentage: 0 });

      console.log("🖼️ Starting image upload:", fileData.name);

      const imageUrl = await uploadImage(
        apolloClient,
        fileData,
        folder,
        (progress) => {
          console.log("Upload progress:", progress);
          setUploadProgress(progress);
        }
      );

      console.log("✅ Upload successful:", imageUrl);
      setSelectedImage(imageUrl);
      onImageSelected(imageUrl);

      // Close modal after successful upload
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      Alert.alert(
        "Lỗi upload",
        error instanceof Error
          ? error.message
          : "Không thể upload ảnh. Vui lòng thử lại.",
        [{ text: "OK" }]
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleSelectFromLibrary = async () => {
    try {
      const images = await pickImage({
        allowsMultipleSelection: false,
        allowsEditing,
        quality: compressionOptions?.quality || 0.8,
        compressionOptions,
      });

      if (images.length > 0) {
        await handleImageUpload(images[0]);
      }
    } catch (error) {
      console.error("Error selecting from library:", error);
      Alert.alert(
        "Lỗi",
        error instanceof Error
          ? error.message
          : "Không thể chọn ảnh từ thư viện",
        [{ text: "OK" }]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const image = await captureImage({
        allowsEditing,
        quality: compressionOptions?.quality || 0.8,
        compressionOptions,
      });

      if (image) {
        await handleImageUpload(image);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể chụp ảnh",
        [{ text: "OK" }]
      );
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setUploadProgress(null);
    setUploading(false);
    onClose();
  };

  const progressPercentage = uploadProgress?.percentage || 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-InterBold text-gray-800">
              {title}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 items-center justify-center"
              disabled={uploading}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Upload Progress */}
          {uploading && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-InterMedium text-gray-600">
                  Đang upload...
                </Text>
                <Text className="text-sm font-InterMedium text-[#7CB518]">
                  {progressPercentage}%
                </Text>
              </View>

              <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-[#7CB518] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>

              {selectedImage && (
                <View className="mt-4 items-center">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="cover"
                  />
                  <Text className="text-xs text-green-600 mt-2">
                    ✅ Upload thành công!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {!uploading && (
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleSelectFromLibrary}
                className="flex-row items-center p-4 bg-gray-50 rounded-2xl"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-[#7CB518] rounded-full items-center justify-center mr-4">
                  <Ionicons name="images" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-InterSemiBold text-gray-800 mb-1">
                    Chọn từ thư viện
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Chọn ảnh có sẵn trong điện thoại
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-row items-center p-4 bg-gray-50 rounded-2xl"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-[#7CB518] rounded-full items-center justify-center mr-4">
                  <Ionicons name="camera" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-InterSemiBold text-gray-800 mb-1">
                    Chụp ảnh mới
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Sử dụng camera để chụp ảnh
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {uploading && (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#7CB518" />
              <Text className="text-sm text-gray-500 mt-2">
                Đang xử lý và upload ảnh...
              </Text>
            </View>
          )}

          {/* Close Button */}
          {!uploading && (
            <TouchableOpacity
              onPress={handleClose}
              className="mt-6 p-4 bg-gray-100 rounded-2xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-gray-600 font-InterMedium">Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
