import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type SubscriptionOptionProps = {
  period: number;
  label: string;
  subtitle: string;
  price: string;
  selected: boolean;
  onPress: () => void;
};

const SubscriptionOption = ({
  period,
  label,
  subtitle,
  price,
  selected,
  onPress,
}: SubscriptionOptionProps) => {
  return (
    <TouchableOpacity
      className={`w-full flex-row items-center rounded-2xl px-5 py-4 mb-4 ${
        selected
          ? "border-2 border-[#FFD36A] bg-[#646B85]"
          : "border-0 bg-[#646B85]"
      } shadow-md`}
      style={
        selected
          ? {
              shadowColor: "#FFD36A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }
          : {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2,
            }
      }
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="text-white text-3xl font-extrabold leading-tight">
          {period} <Text className="text-xl font-bold">{label}</Text>
        </Text>
        <Text className="text-[#B0B6C6] text-base mt-1">{subtitle}</Text>
      </View>
      <Text className="text-white text-xl font-bold">{price}</Text>
    </TouchableOpacity>
  );
};

export default SubscriptionOption;
