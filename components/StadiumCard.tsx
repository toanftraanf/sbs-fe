import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AnimatedScale = number | Animated.AnimatedInterpolation<string | number>;

interface StadiumCardProps {
  name: string;
  rating: number;
  distance: string;
  address: string;
  image: string;
  onPressBook?: () => void;
  scale?: AnimatedScale;
}

const StadiumCard: React.FC<StadiumCardProps> = ({
  name,
  rating,
  distance,
  address,
  image,
  onPressBook,
  scale = 1,
}) => {
  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{name}</Text>
        <View style={styles.cardRow}>
          <Ionicons name="star" size={14} color="#7CB518" />
          <Text style={styles.cardRating}>{rating}</Text>
          <Text style={styles.cardDistance}>{distance}</Text>
        </View>
        <Text style={styles.cardAddress}>{address}</Text>
        <TouchableOpacity style={styles.bookButton} onPress={onPressBook}>
          <Text style={styles.bookButtonText}>Đặt lịch</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  cardImage: {
    width: "100%",
    height: 80,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 10,
  },
  cardName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  cardRating: {
    color: "#7CB518",
    fontWeight: "bold",
    marginLeft: 4,
    marginRight: 8,
    fontSize: 13,
  },
  cardDistance: {
    color: "#888",
    fontSize: 12,
  },
  cardAddress: {
    color: "#888",
    fontSize: 12,
    marginBottom: 6,
  },
  bookButton: {
    backgroundColor: "#E6F4EA",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#7CB518",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default StadiumCard;
