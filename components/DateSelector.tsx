import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

interface DateItem {
  key: string;
  day: string;
  date: string;
  month: string;
}

interface DateSelectorProps {
  dates: DateItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  selectedKey,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="flex-row gap-2 mb-2"
  >
    {dates.map((d) => (
      <TouchableOpacity
        key={d.key}
        onPress={() => onSelect(d.key)}
        className={`items-center px-3 py-2 rounded-lg border mr-2 ${
          selectedKey === d.key
            ? "bg-primary border-primary"
            : "bg-white border-[#C7D7B5]"
        }`}
      >
        <Text
          className={`text-xs ${
            selectedKey === d.key ? "text-white" : "text-primary"
          }`}
        >
          {d.day}
        </Text>
        <Text
          className={`text-lg font-bold ${
            selectedKey === d.key ? "text-white" : "text-primary"
          }`}
        >
          {d.date}
        </Text>
        <Text
          className={`text-xs ${
            selectedKey === d.key ? "text-white" : "text-primary"
          }`}
        >
          {d.month}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default DateSelector;
