import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type BuyPremiumButtonProps = {
  onPress: () => void;
};

const BuyPremiumButton = ({ onPress }: BuyPremiumButtonProps) => {
  return (
    <View className="items-center mb-6 mt-2 w-full">
      <TouchableOpacity
        className="w-full rounded-full overflow-hidden"
        activeOpacity={0.85}
        onPress={onPress}
      >
        <LinearGradient
          colors={["#FFD36A", "#FFB86A"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: "100%",
            paddingVertical: 18,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-white text-lg font-bold">Mua gói Premium</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default BuyPremiumButton;
