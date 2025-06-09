import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardTypeOptions,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DynamicInputListProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function DynamicInputList({
  items,
  onItemsChange,
  placeholder = "Nhập thông tin",
  keyboardType = "default",
  maxLength,
  multiline = false,
  numberOfLines = 1,
}: DynamicInputListProps) {
  const updateItem = (index: number, text: string) => {
    const updatedItems = [...items];
    updatedItems[index] = text;
    onItemsChange(updatedItems);
  };

  const addItem = () => {
    onItemsChange([...items, ""]);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    onItemsChange(updatedItems);
  };

  return (
    <>
      {items.map((item, idx) => (
        <View key={idx} className="flex-row items-center mb-3">
          <TextInput
            placeholder={placeholder}
            value={item}
            onChangeText={(text) => updateItem(idx, text)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            keyboardType={keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            returnKeyType="next"
            blurOnSubmit={false}
            textAlignVertical={multiline ? "top" : "center"}
          />
          <TouchableOpacity
            onPress={() => {
              if (idx === items.length - 1) {
                addItem();
              } else {
                removeItem(idx);
              }
            }}
            className="ml-2"
          >
            <Ionicons
              name={
                idx === items.length - 1
                  ? "add-circle-outline"
                  : "remove-circle-outline"
              }
              size={28}
              color={idx === items.length - 1 ? "#4CAF50" : "#FF5252"}
            />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}
