import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PremiumPackageCardProps {
  onPress?: () => void;
  variant?: "default" | "gradient";
  className?: string;
}

const PremiumPackageCard: React.FC<PremiumPackageCardProps> = ({
  onPress,
  variant = "default",
  className = "",
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default action
      console.log("Premium package pressed");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={className}
      style={{
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6, // For Android shadow
      }}
    >
      <LinearGradient
        colors={["#FBD863", "#ECC275", "#FCC271"]}
        locations={[0.1857, 0.5723, 0.8143]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 12,
          padding: 16,
        }}
      >
        <View className="flex-row items-center">
          <MaterialIcons name="workspace-premium" size={32} color="white" />
          <View className="ml-3 px-5 flex-1 text-center items-center justify-center">
            <Text className="text-white font-bold text-lg">GÓI PREMIUM</Text>
            <Text className="text-white text-sm text-center">
              Mở khóa các đặc quyền và loại bỏ quảng cáo
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PremiumPackageCard;
