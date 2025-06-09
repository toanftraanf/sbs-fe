import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

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
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {courtTypes.map((courtType) => (
        <TouchableOpacity
          key={courtType.key}
          onPress={() => onSelect(courtType.key)}
          className={`mr-3 px-4 py-2 rounded-full border ${
            selectedKey === courtType.key
              ? "bg-primary border-primary"
              : "bg-white border-[#C7D7B5]"
          }`}
        >
          <Text
            className={`font-medium ${
              selectedKey === courtType.key ? "text-white" : "text-[#444]"
            }`}
          >
            {courtType.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CourtTypeSelector;
