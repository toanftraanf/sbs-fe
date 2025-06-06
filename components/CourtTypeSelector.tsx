import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CourtType {
  key: string;
  label: string;
}

interface CourtTypeSelectorProps {
  courtTypes: CourtType[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

const CourtTypeSelector: React.FC<CourtTypeSelectorProps> = ({
  courtTypes,
  selectedKey,
  onSelect,
}) => (
  <View className="flex-row gap-2">
    {courtTypes.map((type) => (
      <TouchableOpacity
        key={type.key}
        onPress={() => onSelect(type.key)}
        className={`flex-1 py-2 rounded-lg border text-center ${
          selectedKey === type.key
            ? "bg-primary border-primary"
            : "bg-white border-[#C7D7B5]"
        }`}
      >
        <Text
          className={`text-base text-center font-medium ${
            selectedKey === type.key ? "text-white" : "text-[#444]"
          }`}
        >
          {type.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default CourtTypeSelector;
