import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TimeSlotGridProps {
  timeSlots: string[];
  courts: string[];
  slotStatus: string[][]; // 2D array: [row][col] = 'lock' | 'selected' | 'available'
  onSlotPress?: (rowIdx: number, colIdx: number) => void;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  timeSlots,
  courts,
  slotStatus,
  onSlotPress,
}) => {
  const [slotStatusState, setSlotStatusState] = useState(slotStatus);

  const handleSlotPress = (rowIdx: number, colIdx: number) => {
    setSlotStatusState((prev) => {
      return prev.map((row, r) =>
        row.map((status, c) => {
          if (r === rowIdx && c === colIdx) {
            if (status === "available") return "selected";
            if (status === "selected") return "available";
          }
          return status;
        })
      );
    });
  };

  return (
    <View>
      {/* Header row */}
      <View className="flex-row">
        <View className="w-24" />
        {courts.map((court) => (
          <View key={court} className="w-20 items-center justify-center">
            <Text className="text-xs font-medium text-[#888]">{court}</Text>
          </View>
        ))}
      </View>
      {/* Time slots */}
      {timeSlots.map((slot, rowIdx) => (
        <View key={slot} className="flex-row items-center mb-1">
          <View className="w-24 items-center justify-center">
            <Text className="text-xs text-[#888]">{slot}</Text>
          </View>
          {courts.map((_, colIdx) => {
            const status =
              slotStatusState[rowIdx] && slotStatusState[rowIdx][colIdx]
                ? slotStatusState[rowIdx][colIdx]
                : "available";
            return (
              <TouchableOpacity
                key={colIdx}
                disabled={status === "lock"}
                onPress={() => handleSlotPress(rowIdx, colIdx)}
                className={`w-20 h-8 rounded-full items-center justify-center border mx-0.5 ${
                  status === "lock"
                    ? "bg-[#E5E5E5] border-[#E5E5E5]"
                    : status === "selected"
                    ? "bg-primary border-primary"
                    : "bg-white border-[#C7D7B5]"
                }`}
              >
                {status === "lock" ? (
                  <FontAwesome name="lock" size={16} color="#A0A0A0" />
                ) : status === "selected" ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : (
                  <MaterialIcons name="add" size={20} color="#A0A0A0" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default TimeSlotGrid;
