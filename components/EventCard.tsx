import { UserEvent } from "@/services/event";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EventCardProps {
  event: UserEvent;
  onPress?: () => void;
}

// Sport image mapping for different sports
const getSportImage = (sportName: string) => {
  const name = sportName.toLowerCase();
  if (name.includes("cầu lông") || name.includes("badminton"))
    return require("@/assets/images/badminton.png");
  if (name.includes("quần vợt") || name.includes("tennis"))
    return require("@/assets/images/tennis.png");
  if (name.includes("bóng bàn") || name.includes("ping pong"))
    return require("@/assets/images/table-tennis.png");
  if (name.includes("pickleball"))
    return require("@/assets/images/pickleball.png");
  return require("@/assets/images/badminton.png"); // default image
};

const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatEventTime = (timeString: string) => {
  return timeString.substring(0, 5); // Format HH:MM
};

export default function EventCard({ event, onPress }: EventCardProps) {
  const primarySport = event.sports.length > 0 ? event.sports[0] : null;
  const sportImage = primarySport
    ? getSportImage(primarySport.name)
    : require("@/assets/images/badminton.png");
  const hasStadium = event.stadium && event.stadium.name !== "Chưa có sân";

  return (
    <View style={styles.eventCardContainer}>
      {/* Date Header */}
      <View style={styles.eventHeader}>
        <Text style={styles.eventHeaderText}>
          DATE: {formatEventDate(event.eventDate)} | Tv:{" "}
          {event.participants.length}/{event.maxParticipants}
        </Text>
        <View style={styles.sportIconContainer}>
          <Image source={sportImage} style={styles.sportImage} />
          <Text style={styles.sportText}>
            {primarySport ? primarySport.name : "Thể thao"}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <TouchableOpacity
        style={styles.eventMainContent}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {/* Left side - Image */}
        <View style={styles.eventImageContainer}>
          <Image
            source={{
              uri:
                hasStadium && event.stadium.avatarUrl
                  ? event.stadium.avatarUrl
                  : hasStadium
                  ? "https://images.unsplash.com/photo-1544725176-7c40e5a2c314?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
                  : "https://via.placeholder.com/120x80/E5E7EB/9CA3AF?text=No+Image",
            }}
            style={styles.eventImage}
          />
        </View>

        {/* Right side - Content */}
        <View style={styles.eventContentContainer}>
          {/* Creator name only */}
          <View style={styles.eventTopRow}>
            <Text style={styles.eventCreatorName}>
              {event.creator.fullName}
            </Text>
          </View>
          <Text style={styles.eventTimeRangeText}>
            {formatEventTime(event.startTime)} -{" "}
            {formatEventTime(event.endTime)}
          </Text>
          {/* Stadium info */}
          <View style={styles.eventStadiumRow}>
            <Text style={styles.eventStadiumName}>
              {hasStadium ? event.stadium.name : "Sân N1"}
            </Text>
          </View>

          {/* Location with distance */}
          <View style={styles.eventLocationRow}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.eventLocationText}>
              {hasStadium ? "2.6 km" : "5.2 km"}
            </Text>
          </View>

          <Text style={styles.eventAddressText}>
            {hasStadium
              ? "Số 12, Đường A3, P. Long..."
              : "Số 17, Đường D4, P. Long..."}
          </Text>

          {/* Status indicator */}
          {!hasStadium && (
            <View style={styles.statusRow}>
              <Ionicons name="location" size={12} color="#F59E0B" />
              <Text style={styles.statusText}>Chưa có sân</Text>
            </View>
          )}
        </View>

        {/* Arrow button */}
        <TouchableOpacity style={styles.eventArrowButton}>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden",
  },
  eventHeader: {
    backgroundColor: "#9CA3AF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eventHeaderText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    flex: 1,
  },
  sportIconContainer: {
    backgroundColor: "#5A983B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  eventMainContent: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  eventImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  eventContentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  eventTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventCreatorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  eventTimeRangeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#222",
  },
  eventStadiumRow: {
    marginBottom: 2,
  },
  eventStadiumName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222",
  },
  eventLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  eventLocationText: {
    marginLeft: 4,
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  eventAddressText: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  statusText: {
    marginLeft: 4,
    fontSize: 10,
    color: "#F59E0B",
    fontWeight: "500",
  },
  eventArrowButton: {
    backgroundColor: "#5A983B",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 12,
  },
  sportImage: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  sportText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
