import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Sport {
  key: string;
  label: string;
}

interface StadiumSportsProps {
  sports: Sport[];
  onSelect?: (key: string) => void;
}

const StadiumSports: React.FC<StadiumSportsProps> = ({ sports, onSelect }) => (
  <View style={{ flexDirection: "row", marginTop: 8 }}>
    {sports.map((sport) => (
      <TouchableOpacity
        key={sport.key}
        style={styles.sportChip}
        onPress={() => onSelect && onSelect(sport.key)}
      >
        <Text style={styles.sportChipText}>{sport.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  sportChip: {
    backgroundColor: "#E6F4EA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  sportChipText: {
    color: "#5A983B",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default StadiumSports;
