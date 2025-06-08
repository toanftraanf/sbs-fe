import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  containerClassName?: string;
}

export default function DropdownField({
  label,
  value,
  onChange,
  options,
  placeholder,
  containerClassName = "mb-8",
}: DropdownFieldProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setShowDropdown(false);
  };

  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>
      <TouchableOpacity
        className="border border-secondary rounded-xl px-4 py-3 flex-row items-center"
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text className={`flex-1 ${value ? "text-black" : "text-gray-400"}`}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#515151" />
      </TouchableOpacity>

      {showDropdown && (
        <View className="border border-secondary rounded-xl mt-2 bg-white">
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              className="px-4 py-3 border-b border-gray-200 last:border-b-0"
              onPress={() => handleSelect(option.value)}
            >
              <Text className="text-black">{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
