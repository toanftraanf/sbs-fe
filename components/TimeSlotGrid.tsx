import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  const handleSlotPress = (rowIdx: number, colIdx: number) => {
    if (onSlotPress) onSlotPress(rowIdx, colIdx);
  };

  // Debug logging
  React.useEffect(() => {
    console.log("🏟️ TimeSlotGrid received props:", {
      timeSlotsCount: timeSlots.length,
      courtsCount: courts.length,
      slotStatusDimensions: `${slotStatus.length}x${
        slotStatus[0]?.length || 0
      }`,
      slotStatus: slotStatus,
    });

    // Log selected slots
    let selectedSlots = 0;
    slotStatus.forEach((row, rowIndex) => {
      row.forEach((status, colIndex) => {
        if (status === "selected") {
          selectedSlots++;
          console.log(
            `🎯 TimeSlotGrid sees SELECTED slot at [${rowIndex}][${colIndex}] = ${status}`
          );
        }
      });
    });
    console.log(`🎯 TimeSlotGrid total selected slots: ${selectedSlots}`);
  }, [timeSlots, courts, slotStatus]);

  return (
    <View className="w-full">
      <View className="flex-row">
        {/* Fixed time column */}
        <View className="w-32">
          {/* Empty header space */}
          <View className="h-6" />
          {/* Time labels */}
          {timeSlots.map((slot) => (
            <View key={slot} className="h-10 items-center justify-center mb-1">
              <Text className="text-xs text-[#888]">{slot}</Text>
            </View>
          ))}
        </View>

        {/* Scrollable courts and slots */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          <View>
            {/* Court headers */}
            <View className="flex-row h-6">
              {courts.map((court) => (
                <View key={court} className="w-20 items-center justify-center">
                  <Text className="text-xs font-medium text-[#888]">
                    {court}
                  </Text>
                </View>
              ))}
            </View>

            {/* Time slot rows */}
            {timeSlots.map((slot, rowIdx) => (
              <View key={slot} className="flex-row items-center mb-1 h-10">
                {courts.map((_, colIdx) => {
                  const status =
                    slotStatus[rowIdx] && slotStatus[rowIdx][colIdx]
                      ? slotStatus[rowIdx][colIdx]
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
        </ScrollView>
      </View>
    </View>
  );
};

export default TimeSlotGrid;
