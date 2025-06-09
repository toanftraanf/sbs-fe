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
  address: string;
  image: string;
  onPressBook?: () => void;
  scale?: AnimatedScale;
}

const StadiumCard: React.FC<StadiumCardProps> = ({
  name,
  rating,
  address,
  image,
  onPressBook,
  scale = 1,
}) => {
  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.nameRatingRow}>
          <Text style={styles.cardName}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#7CB518" />
            <Text style={styles.cardRating}>{rating}</Text>
          </View>
        </View>
        <Text style={styles.cardAddress} numberOfLines={2} ellipsizeMode="tail">
          {address}
        </Text>
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
    minHeight: 160,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 80,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    minHeight: 80,
  },
  nameRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    flexShrink: 0,
  },
  cardName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  cardRating: {
    color: "#7CB518",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  cardAddress: {
    color: "#888",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
    flexGrow: 1,
    flexShrink: 1,
  },
  bookButton: {
    backgroundColor: "#E6F4EA",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    flexShrink: 0,
    minHeight: 36,
  },
  bookButtonText: {
    color: "#7CB518",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default StadiumCard;
