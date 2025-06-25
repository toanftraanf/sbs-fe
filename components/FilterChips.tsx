import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface FilterItem {
  id: string;
  label: string;
  count?: number;
  icon?: any; // For sport icons
}

interface FilterChipsProps {
  data: FilterItem[];
  selectedValue: string;
  onSelectionChange: (value: string) => void;
  getActiveStyle?: (id: string) => string;
  getInactiveStyle?: () => string;
  getActiveTextStyle?: (id: string) => string;
  getInactiveTextStyle?: () => string;
  renderIcon?: (item: FilterItem) => React.ReactNode;
  containerStyle?: string;
}

export default function FilterChips({
  data,
  selectedValue,
  onSelectionChange,
  getActiveStyle = () => "bg-primary",
  getInactiveStyle = () => "bg-gray-100",
  getActiveTextStyle = () => "text-white",
  getInactiveTextStyle = () => "text-gray-600",
  renderIcon,
  containerStyle = "bg-white px-4 py-3",
}: FilterChipsProps) {
  const renderFilterButton = ({ item }: { item: FilterItem }) => {
    const isSelected = selectedValue === item.id;

    return (
      <TouchableOpacity
        onPress={() => onSelectionChange(item.id)}
        className={`px-4 py-2 rounded-full mr-2 ${
          isSelected ? getActiveStyle(item.id) : getInactiveStyle()
        }`}
      >
        <View className="flex-row items-center">
          {renderIcon && renderIcon(item)}
          <Text
            className={`text-sm font-medium ${
              isSelected ? getActiveTextStyle(item.id) : getInactiveTextStyle()
            }`}
          >
            {item.label}
            {item.count !== undefined && ` (${item.count})`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className={containerStyle}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderFilterButton}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
