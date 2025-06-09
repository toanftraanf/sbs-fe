import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { UploadProgress as UploadProgressType } from "../services/fileUpload";

interface UploadProgressProps {
  progress: UploadProgressType | null;
  fileName?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  size?: "small" | "medium" | "large";
}

export default function UploadProgress({
  progress,
  fileName,
  onCancel,
  showCancel = true,
  size = "medium",
}: UploadProgressProps) {
  if (!progress) return null;

  const { percentage, loaded, total } = progress;
  const isComplete = percentage >= 100;

  const sizeClasses = {
    small: {
      container: "p-3",
      bar: "h-2",
      text: "text-xs",
      icon: 16,
    },
    medium: {
      container: "p-4",
      bar: "h-3",
      text: "text-sm",
      icon: 20,
    },
    large: {
      container: "p-6",
      bar: "h-4",
      text: "text-base",
      icon: 24,
    },
  };

  const classes = sizeClasses[size];

  return (
    <View
      className={`bg-white rounded-xl border border-gray-200 ${classes.container}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {isComplete ? (
            <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="checkmark" size={classes.icon} color="#22C55E" />
            </View>
          ) : (
            <ActivityIndicator
              size="small"
              color="#7CB518"
              style={{ marginRight: 12 }}
            />
          )}

          <View className="flex-1">
            <Text
              className={`font-InterSemiBold text-gray-800 ${classes.text}`}
            >
              {isComplete ? "Upload hoàn thành" : "Đang upload..."}
            </Text>
            {fileName && (
              <Text
                className={`text-gray-500 ${classes.text}`}
                numberOfLines={1}
              >
                {fileName}
              </Text>
            )}
          </View>
        </View>

        {/* Cancel Button */}
        {showCancel && !isComplete && onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            className="w-8 h-8 items-center justify-center ml-2"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={classes.icon} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <View
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${classes.bar}`}
        >
          <View
            className={`bg-[#7CB518] rounded-full transition-all duration-300 ${classes.bar}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </View>
      </View>

      {/* Progress Info */}
      <View className="flex-row items-center justify-between">
        <Text className={`font-InterMedium text-[#7CB518] ${classes.text}`}>
          {percentage}%
        </Text>

        {total > 0 && (
          <Text className={`text-gray-500 ${classes.text}`}>
            {formatBytes(loaded)} / {formatBytes(total)}
          </Text>
        )}
      </View>

      {/* Success Message */}
      {isComplete && (
        <View className="mt-2 flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <Text className="text-green-600 text-xs ml-1 font-InterMedium">
            Ảnh đã được upload thành công
          </Text>
        </View>
      )}
    </View>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
