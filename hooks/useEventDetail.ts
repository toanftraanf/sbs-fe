import { useAuth } from "@/contexts/AuthContext";
import eventService, { UserEvent } from "@/services/event";
import { useState } from "react";
import { Alert } from "react-native";

export default function useEventDetail() {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isUserParticipant = (event: UserEvent): boolean => {
    if (!user) return false;
    return event.participants.some(
      (participant) => 
        participant.user.id === user.id && 
        participant.status === "CONFIRMED"
    );
  };

  const isEventCreator = (event: UserEvent): boolean => {
    if (!user) return false;
    return event.creator.id === user.id;
  };

  const canJoinEvent = (event: UserEvent): boolean => {
    if (!user) return false;
    if (isEventCreator(event)) return false;
    if (isUserParticipant(event)) return false;
    
    const confirmedParticipants = event.participants.filter(
      (p) => p.status === "CONFIRMED"
    );
    
    return confirmedParticipants.length < event.maxParticipants;
  };

  const joinEvent = async (event: UserEvent): Promise<boolean> => {
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để tham gia sự kiện");
      return false;
    }

    if (!canJoinEvent(event)) {
      Alert.alert("Không thể tham gia", "Sự kiện đã đầy hoặc bạn đã tham gia");
      return false;
    }

    try {
      setIsJoining(true);
      await eventService.joinEvent(event.id);
      Alert.alert("Thành công", "Bạn đã tham gia sự kiện thành công!");
      return true;
    } catch (error) {
      console.error("Error joining event:", error);
      Alert.alert(
        "Lỗi", 
        error instanceof Error ? error.message : "Không thể tham gia sự kiện"
      );
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const leaveEvent = async (event: UserEvent): Promise<boolean> => {
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để rời khỏi sự kiện");
      return false;
    }

    if (!isUserParticipant(event)) {
      Alert.alert("Lỗi", "Bạn chưa tham gia sự kiện này");
      return false;
    }

    try {
      setIsLeaving(true);
      await eventService.leaveEvent(event.id);
      Alert.alert("Thành công", "Bạn đã rời khỏi sự kiện");
      return true;
    } catch (error) {
      console.error("Error leaving event:", error);
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể rời khỏi sự kiện"
      );
      return false;
    } finally {
      setIsLeaving(false);
    }
  };

  const confirmJoinEvent = (event: UserEvent) => {
    Alert.alert(
      "Tham gia sự kiện",
      `Bạn có chắc chắn muốn tham gia sự kiện "${event.title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Tham gia",
          onPress: () => joinEvent(event),
        },
      ]
    );
  };

  const confirmLeaveEvent = (event: UserEvent) => {
    Alert.alert(
      "Rời khỏi sự kiện",
      `Bạn có chắc chắn muốn rời khỏi sự kiện "${event.title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Rời khỏi",
          style: "destructive",
          onPress: () => leaveEvent(event),
        },
      ]
    );
  };

  return {
    isJoining,
    isLeaving,
    isUserParticipant,
    isEventCreator,
    canJoinEvent,
    joinEvent,
    leaveEvent,
    confirmJoinEvent,
    confirmLeaveEvent,
  };
} 