import { images } from "@/constants";
import useEventDetail from "@/hooks/useEventDetail";
import { UserEvent } from "@/services/event";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventDetail() {
  const { eventData } = useLocalSearchParams();
  const [event, setEvent] = useState<UserEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {
    isJoining,
    isLeaving,
    isUserParticipant,
    isEventCreator,
    canJoinEvent,
    confirmJoinEvent,
    confirmLeaveEvent,
  } = useEventDetail();

  useEffect(() => {
    if (eventData) {
      try {
        const parsedEvent = JSON.parse(eventData as string) as UserEvent;
        setEvent(parsedEvent);
        setLoading(false);
      } catch (error) {
        Alert.alert(
          "Lỗi",
          "Không thể tải thông tin sự kiện. Vui lòng thử lại."
        );
        router.back();
      }
    }
  }, [eventData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Format HH:MM
  };

  const getSportIcon = (sportName: string) => {
    const name = sportName.toLowerCase();
    if (name.includes("cầu lông") || name.includes("badminton"))
      return "fitness-outline";
    if (name.includes("tennis")) return "tennisball-outline";
    if (name.includes("bóng bàn")) return "library-outline";
    if (name.includes("pickleball")) return "american-football-outline";
    return "fitness-outline";
  };

  const renderParticipantAvatar = (
    participant: UserEvent["participants"][0]
  ) => {
    const user = participant.user;
    if (user?.fullName) {
      const initials = user.fullName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <View className="w-8 h-8 rounded-full bg-primary mr-2 items-center justify-center">
          <Text className="text-white text-xs font-bold">{initials}</Text>
        </View>
      );
    }

    return (
      <View className="w-8 h-8 rounded-full bg-gray-300 mr-2 items-center justify-center">
        <Ionicons name="person" size={16} color="#666" />
      </View>
    );
  };

  const renderActionButton = () => {
    if (!event) return null;

    if (isEventCreator(event)) {
      return (
        <TouchableOpacity
          className="bg-gray-500 rounded-xl py-3 items-center"
          disabled
        >
          <Text className="text-white font-bold text-lg">Bạn là người tạo</Text>
        </TouchableOpacity>
      );
    }

    if (isUserParticipant(event)) {
      return (
        <TouchableOpacity
          className="bg-red-500 rounded-xl py-3 items-center"
          onPress={() => confirmLeaveEvent(event)}
          disabled={isLeaving}
        >
          <Text className="text-white font-bold text-lg">
            {isLeaving ? "Đang rời..." : "Rời khỏi sự kiện"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (canJoinEvent(event)) {
      return (
        <TouchableOpacity
          className="bg-primary rounded-xl py-3 items-center"
          onPress={() => confirmJoinEvent(event)}
          disabled={isJoining}
        >
          <Text className="text-white font-bold text-lg">
            {isJoining ? "Đang tham gia..." : "Tham gia sự kiện"}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="bg-gray-400 rounded-xl py-3 items-center"
        disabled
      >
        <Text className="text-white font-bold text-lg">Sự kiện đã đầy</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5A983B" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Không tìm thấy thông tin sự kiện</Text>
      </View>
    );
  }

  const confirmedParticipants = event.participants.filter(
    (p) => p.status === "CONFIRMED"
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Stadium image as header with overlayed buttons */}
      <View className="w-full h-48 relative">
        <Image
          source={
            event.stadium.avatarUrl
              ? { uri: event.stadium.avatarUrl }
              : images.defaultBanner
          }
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}
          className="bg-white/80 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#5A983B" />
        </TouchableOpacity>
        {/* Share button */}
        <TouchableOpacity
          onPress={() => {}}
          style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}
          className="bg-white/80 rounded-full p-2"
        >
          <Ionicons name="share-social" size={22} color="#5A983B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Event info card */}
        <View className="bg-white rounded-t-3xl -mt-6 pb-4 px-5 shadow-md">
          {/* Event Title */}
          <Text className="text-2xl font-bold mt-6 mb-2">{event.title}</Text>

          {/* Privacy and cost sharing badges */}
          <View className="flex-row items-center mb-4">
            <View
              className={`px-3 py-1 rounded-full mr-2 ${
                event.isPrivate ? "bg-orange-100" : "bg-green-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  event.isPrivate ? "text-orange-700" : "text-green-700"
                }`}
              >
                {event.isPrivate ? "Chỉ được mời" : "Công khai"}
              </Text>
            </View>
            {event.isSharedCost && (
              <View className="px-3 py-1 rounded-full bg-blue-100">
                <Text className="text-sm font-medium text-blue-700">
                  Chi phí chung
                </Text>
              </View>
            )}
          </View>

          {/* Date and time */}
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="calendar-today" size={18} color="#5A983B" />
            <Text className="ml-2 text-gray-700">
              {formatDate(event.eventDate)}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="time" size={18} color="#5A983B" />
            <Text className="ml-2 text-gray-700">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </Text>
          </View>

          {/* Stadium location */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={18} color="#5A983B" />
            <Text className="ml-2 text-gray-700 flex-1">
              {event.stadium.name}
            </Text>
          </View>
          <Text className="ml-6 text-gray-600 text-sm mb-2">
            {event.stadium.address}
          </Text>

          {/* Participants count */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="people" size={18} color="#5A983B" />
            <Text className="ml-2 text-gray-700">
              {confirmedParticipants.length}/{event.maxParticipants} người tham
              gia
            </Text>
          </View>

          <View className="border-b border-gray-200 my-4" />

          {/* Sports */}
          <Text className="font-bold text-base mb-2">Môn thể thao</Text>
          <View className="flex-row mb-4">
            {event.sports?.map((sport, idx) => (
              <View
                key={idx}
                className="flex-row items-center px-4 py-2 mr-2 rounded-full border border-[#C7D7B5] bg-white"
              >
                <Ionicons
                  name={getSportIcon(sport.name) as any}
                  size={16}
                  color="#5A983B"
                />
                <Text className="ml-2 text-[#444] font-medium">
                  {sport.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Creator */}
          <Text className="font-bold text-base mb-2">Người tạo sự kiện</Text>
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-primary mr-3 items-center justify-center">
              <Text className="text-white text-sm font-bold">
                {event.creator.fullName
                  ?.split(" ")
                  .map((name) => name.charAt(0))
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {event.creator.fullName}
              </Text>
              <Text className="text-sm text-gray-600">
                {event.creator.phoneNumber}
              </Text>
            </View>
          </View>

          {/* Coach (if any) */}
          {event.coach && (
            <>
              <Text className="font-bold text-base mb-2">Huấn luyện viên</Text>
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-500 mr-3 items-center justify-center">
                  <Text className="text-white text-sm font-bold">
                    {event.coach.user.fullName
                      ?.split(" ")
                      .map((name) => name.charAt(0))
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {event.coach.user.fullName}
                  </Text>
                  <Text className="text-sm text-primary font-medium">
                    {event.coach.hourlyRate.toLocaleString("vi-VN")}đ/30 phút
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {event.coach.user.phoneNumber}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Participants */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-base">Người tham gia</Text>
            <Text className="text-sm text-gray-600">
              {confirmedParticipants.length}/{event.maxParticipants}
            </Text>
          </View>
          {confirmedParticipants.length > 0 ? (
            <View className="mb-4">
              {confirmedParticipants.slice(0, 5).map((participant) => (
                <View
                  key={participant.id}
                  className="flex-row items-center mb-2"
                >
                  {renderParticipantAvatar(participant)}
                  <Text className="font-medium text-gray-900">
                    {participant.user.fullName}
                  </Text>
                </View>
              ))}
              {confirmedParticipants.length > 5 && (
                <Text className="text-sm text-gray-600 ml-10">
                  +{confirmedParticipants.length - 5} người khác
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-gray-500 text-sm mb-4">
              Chưa có ai tham gia
            </Text>
          )}

          {/* Description */}
          {event.description && (
            <>
              <Text className="font-bold text-base mb-2">Dụng cụ</Text>
              <Text className="text-gray-700 mb-4">{event.description}</Text>
            </>
          )}

          {/* Additional Notes */}
          {event.additionalNotes && (
            <>
              <Text className="font-bold text-base mb-2">Ghi chú</Text>
              <Text className="text-gray-700 mb-4">
                {event.additionalNotes}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Action button at the bottom */}
      <View className="p-4 bg-white border-t border-gray-200">
        {renderActionButton()}
      </View>
    </View>
  );
}

export const options = {
  headerShown: false,
};
