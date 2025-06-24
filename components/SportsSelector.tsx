import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import sportsService from "../services/sports";
import { Sport } from "../types";

interface SportsSelectorProps {
  label: string;
  selectedSports: number[];
  onSportsChange: (sportIds: number[]) => void;
  containerClassName?: string;
}

// Icon mapping for different sports
const getSportIcon = (sportName: string): keyof typeof Ionicons.glyphMap => {
  const name = sportName.toLowerCase();
  if (name.includes("cầu lông") || name.includes("badminton"))
    return "fitness-outline";
  if (name.includes("quần vợt") || name.includes("tennis"))
    return "tennisball-outline";
  if (name.includes("bóng bàn") || name.includes("ping pong"))
    return "library-outline";
  if (name.includes("pickleball")) return "american-football-outline";
  return "fitness-outline"; // default icon
};

export default function SportsSelector({
  label,
  selectedSports,
  onSportsChange,
  containerClassName = "mb-4",
}: SportsSelectorProps) {
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setIsLoading(true);
      const sports = await sportsService.getAllSports();
      setAvailableSports(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSport = (sportId: number) => {
    if (selectedSports.includes(sportId)) {
      // Remove sport
      onSportsChange(selectedSports.filter((id) => id !== sportId));
    } else {
      // Add sport
      onSportsChange([...selectedSports, sportId]);
    }
  };

  if (isLoading) {
    return (
      <View className={containerClassName}>
        <Text className="mb-1 font-InterSemiBold">{label}</Text>
        <View className="flex-row items-center justify-center py-4">
          <ActivityIndicator size="small" color="#5A983B" />
          <Text className="ml-2 text-gray-500">Đang tải môn thể thao...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {availableSports.map((sport) => {
          const isSelected = selectedSports.includes(sport.id);
          const icon = getSportIcon(sport.name);

          return (
            <TouchableOpacity
              key={sport.id}
              className={`mr-3 px-4 py-2 rounded-full border ${
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-white border-secondary"
              }`}
              onPress={() => toggleSport(sport.id)}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={icon}
                  size={16}
                  color={isSelected ? "#FFFFFF" : "#5A983B"}
                  className="mr-1"
                />
                <Text
                  className={`font-InterSemiBold ${
                    isSelected ? "text-white" : "text-primary"
                  }`}
                >
                  {sport.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedSports.length > 0 && (
        <Text className="text-sm text-gray-500 mt-2">
          {`Đã chọn: ${selectedSports.length} môn thể thao`}
        </Text>
      )}
    </View>
  );
}
