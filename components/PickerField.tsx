import { PickerOption } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface PickerFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: PickerOption[];
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerClassName?: string;
}

export default function PickerField({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon = "chevron-down-outline",
  containerClassName = "mb-4",
}: PickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setShowPicker(false);
  };

  const getDisplayText = () => {
    if (value) {
      const selectedOption = options.find((option) => option.value === value);
      return selectedOption?.label || value;
    }
    return placeholder;
  };

  const getSelectedOption = () => {
    return options.find((option) => option.value === value);
  };

  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex-row items-center border border-secondary rounded-xl px-4 py-3"
      >
        <Text className={`flex-1 ${value ? "text-black" : "text-gray-400"}`}>
          {getDisplayText()}
        </Text>
        <Ionicons name={icon} size={20} color="#515151" />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View className="bg-white mx-6 rounded-xl shadow-lg max-h-80 min-w-[280px]">
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="font-InterSemiBold text-lg text-center">
                {label}
              </Text>
            </View>

            <ScrollView className="max-h-60">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`px-4 py-4 border-b border-gray-100 flex-row items-center ${
                    value === option.value ? "bg-green-50" : ""
                  }`}
                  onPress={() => handleSelectOption(option.value)}
                >
                  <Text
                    className={`flex-1 ${
                      value === option.value
                        ? "font-InterSemiBold text-green-700"
                        : "font-InterRegular text-gray-800"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color="#5A983B" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="px-4 py-3 border-t border-gray-200"
              onPress={() => setShowPicker(false)}
            >
              <Text className="text-center font-InterSemiBold text-gray-600">
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
