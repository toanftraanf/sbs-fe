// components/BackgroundDecor.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function BackgroundDecor() {
  return (
    <View style={styles.decorContainer}>
      <MaterialCommunityIcons
        name="soccer"
        size={80}
        style={[styles.decorIcon, { top: 20, left: 20, transform: [{ rotate: "10deg" }] }]}
      />
      <MaterialCommunityIcons
        name="basketball"
        size={70}
        style={[styles.decorIcon, { top: 50, right: 30, transform: [{ rotate: "-15deg" }] }]}
      />
      <MaterialCommunityIcons
        name="tennis-ball"
        size={60}
        style={[styles.decorIcon, { top: 120, left: 100, transform: [{ rotate: "25deg" }] }]}
      />
      <MaterialCommunityIcons
        name="volleyball"
        size={50}
        style={[styles.decorIcon, { bottom: 100, right: 80, transform: [{ rotate: "-20deg" }] }]}
      />
      <MaterialCommunityIcons
        name="badminton"
        size={65}
        style={[styles.decorIcon, { bottom: 60, left: 50, transform: [{ rotate: "15deg" }] }]}
      />
      <MaterialCommunityIcons
        name="table-tennis"
        size={55}
        style={[styles.decorIcon, { bottom: 30, right: 150, transform: [{ rotate: "5deg" }] }]}
      />
      <MaterialCommunityIcons
        name="baseball"
        size={45}
        style={[styles.decorIcon, { top: 200, right: 120, transform: [{ rotate: "-5deg" }] }]}
      />
      <MaterialCommunityIcons
        name="rugby"
        size={90}
        style={[styles.decorIcon, { bottom: 160, left: 150, transform: [{ rotate: "30deg" }] }]}
      />
      <MaterialCommunityIcons
        name="hockey-puck"
        size={40}
        style={[styles.decorIcon, { top: 300, left: 30, transform: [{ rotate: "0deg" }] }]}
      />
      <MaterialCommunityIcons
        name="cricket"
        size={85}
        style={[styles.decorIcon, { bottom: 200, right: 20, transform: [{ rotate: "-25deg" }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  decorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorIcon: {
    position: "absolute",
    color: "#5A983B",
    opacity: 0.12,
  },
});
