import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, View } from "react-native";

interface AddressSearchFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  containerClassName?: string;
}

export default function AddressSearchField({
  label,
  value,
  onChangeText,
  placeholder,
  containerClassName = "mb-4",
}: AddressSearchFieldProps) {
  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>

      <View className="flex-row items-center border border-secondary rounded-xl px-4 py-3">
        <Ionicons
          name="location-outline"
          size={20}
          color="#515151"
          className="mr-2"
        />
        <TextInput
          className="flex-1 ml-2"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}
