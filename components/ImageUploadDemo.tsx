import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { UploadProgress as UploadProgressType } from "../services/fileUpload";
import ImagePickerModal from "./ImagePickerModal";
import UploadProgress from "./UploadProgress";

interface ImageUploadDemoProps {
  folder?: string;
  title?: string;
  compressionOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

export default function ImageUploadDemo({
  folder = "demo",
  title = "Test Upload",
  compressionOptions,
}: ImageUploadDemoProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgressType | null>(null);

  const handleImageSelected = (imageUrl: string) => {
    console.log("✅ Demo: Image uploaded successfully:", imageUrl);
    setUploadedImage(imageUrl);
    Alert.alert(
      "Upload Success!",
      `Image uploaded successfully!\nURL: ${imageUrl}`,
      [{ text: "OK" }]
    );
  };

  const handleClear = () => {
    setUploadedImage(null);
    setProgress(null);
  };

  return (
    <View className="p-4 bg-white rounded-xl border border-gray-200 m-4">
      <Text className="text-lg font-InterBold text-center mb-4">{title}</Text>

      {uploadedImage ? (
        <View className="items-center">
          <Image
            source={{ uri: uploadedImage }}
            className="w-32 h-32 rounded-xl mb-4"
            resizeMode="cover"
          />
          <Text className="text-green-600 font-InterMedium mb-3 text-center">
            ✅ Upload thành công!
          </Text>
          <TouchableOpacity
            onPress={handleClear}
            className="bg-gray-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-InterMedium">Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="w-32 h-32 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mx-auto"
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-upload" size={32} color="#7CB518" />
          <Text className="text-gray-600 mt-2 text-center font-InterMedium">
            Upload Image
          </Text>
        </TouchableOpacity>
      )}

      {progress && (
        <View className="mt-4">
          <UploadProgress
            progress={progress}
            fileName="demo-image.jpg"
            size="small"
          />
        </View>
      )}

      <ImagePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onImageSelected={handleImageSelected}
        folder={folder}
        title="Select Test Image"
        compressionOptions={compressionOptions}
      />
    </View>
  );
}
