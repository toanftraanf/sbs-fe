import { Friend } from "@/hooks/useTeamMatching";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
  friend: Friend;
}

export default function FriendCard({ friend }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
      <View style={styles.infoPanel}>
        <View style={styles.infoHeader}>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.ageText}>{friend.age}t</Text>
        </View>
        <View style={styles.infoLine}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{friend.location}</Text>
        </View>
        <View style={styles.infoLine}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{friend.schedule}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  avatar: { width: "100%", height: "90%" },
  infoPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 84,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: "700", color: "#222" },
  ageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5A983B",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: { marginLeft: 6, fontSize: 12, color: "#666" },
});
