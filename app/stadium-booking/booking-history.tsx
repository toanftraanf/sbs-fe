import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GroupedReservationItem from "@/components/GroupedReservationItem";
import ReservationItem from "@/components/ReservationItem";
import ReservationModal from "@/components/ReservationModal";
import { useAuth } from "@/contexts/AuthContext";
import { getUserReservationsByDateRange } from "@/services/reservation";
import { Reservation } from "@/types";
import ScreenHeader from "@/components/ScreenHeader";

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

type GroupedReservation = {
  reservations: Reservation[];
  startTime: string;
  endTime: string;
  representative: Reservation;
};

type ReservationListItem = Reservation | GroupedReservation;

export default function BookingHistory() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [groupConsecutive, setGroupConsecutive] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchReservations();
    }
  }, [user]);

  useEffect(() => {
    filterAndSearchReservations();
  }, [reservations, searchQuery, filterStatus]);

  const fetchReservations = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!user?.id) {
        console.warn("No user ID available for fetching reservations");
        return;
      }

      // Fetch all reservations (last 6 months)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const response = await getUserReservationsByDateRange(
        Number(user.id),
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      // Sort by date and time (newest first)
      const sortedReservations = response.sort(
        (a: Reservation, b: Reservation) => {
          const dateA = new Date(`${a.date} ${a.startTime}`);
          const dateB = new Date(`${b.date} ${b.startTime}`);
          return dateB.getTime() - dateA.getTime();
        }
      );

      setReservations(sortedReservations);
    } catch (error: any) {
      console.error("Error fetching reservations:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể tải lịch sử đặt sân. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSearchReservations = () => {
    let filtered = [...reservations];

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (reservation) => reservation.status === filterStatus
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (reservation) =>
          reservation.stadium?.name?.toLowerCase().includes(query) ||
          reservation.sport?.toLowerCase().includes(query) ||
          reservation.courtNumber?.toString().includes(query) ||
          reservation.date.includes(query) ||
          reservation.startTime.includes(query) ||
          reservation.endTime.includes(query)
      );
    }

    setFilteredReservations(filtered);
  };

  const groupConsecutiveReservations = (
    reservations: Reservation[]
  ): GroupedReservation[] => {
    if (!reservations.length) return [];

    // Group by date and court first
    const groupedByDateAndCourt: { [key: string]: Reservation[] } = {};

    reservations.forEach((reservation) => {
      const key = `${reservation.date}-${reservation.courtNumber}`;
      if (!groupedByDateAndCourt[key]) {
        groupedByDateAndCourt[key] = [];
      }
      groupedByDateAndCourt[key].push(reservation);
    });

    const displayGroups: GroupedReservation[] = [];

    // For each date-court group, find consecutive time slots
    Object.values(groupedByDateAndCourt).forEach((dateCourtReservations) => {
      // Sort by start time
      const sorted = [...dateCourtReservations].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );

      let currentGroup: Reservation[] = [];

      sorted.forEach((reservation, index) => {
        if (currentGroup.length === 0) {
          currentGroup = [reservation];
        } else {
          const lastReservation = currentGroup[currentGroup.length - 1];
          // Check if current reservation starts when the last one ends
          if (lastReservation.endTime === reservation.startTime) {
            currentGroup.push(reservation);
          } else {
            // Not consecutive, finalize current group
            displayGroups.push({
              reservations: currentGroup,
              startTime: currentGroup[0].startTime,
              endTime: currentGroup[currentGroup.length - 1].endTime,
              representative: currentGroup[0],
            });
            currentGroup = [reservation];
          }
        }

        // Handle last group
        if (index === sorted.length - 1) {
          displayGroups.push({
            reservations: currentGroup,
            startTime: currentGroup[0].startTime,
            endTime: currentGroup[currentGroup.length - 1].endTime,
            representative: currentGroup[0],
          });
        }
      });
    });

    return displayGroups;
  };

  const getStatusCount = (status: FilterStatus) => {
    if (status === "ALL") return reservations.length;
    return reservations.filter((r) => r.status === status).length;
  };

  const getStatusText = (status: FilterStatus) => {
    switch (status) {
      case "ALL":
        return "Tất cả";
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusColor = (status: FilterStatus) => {
    switch (status) {
      case "PENDING":
        return "text-orange-600 bg-orange-100";
      case "CONFIRMED":
        return "text-green-600 bg-green-100";
      case "COMPLETED":
        return "text-blue-600 bg-blue-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const onRefresh = async () => {
    await fetchReservations(true);
  };

  const handleReservationPress = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  const renderFilterButton = (status: FilterStatus) => (
    <TouchableOpacity
      key={status}
      onPress={() => setFilterStatus(status)}
      className={`px-4 py-2 rounded-full mr-2 ${
        filterStatus === status
          ? getStatusColor(status)
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          filterStatus === status
            ? status === "ALL"
              ? "text-gray-800"
              : ""
            : "text-gray-600"
        }`}
      >
        {getStatusText(status)} ({getStatusCount(status)})
      </Text>
    </TouchableOpacity>
  );

  const renderListItem = ({
    item,
    index,
  }: {
    item: ReservationListItem;
    index: number;
  }) => {
    // Check if item is a grouped reservation
    if ("representative" in item) {
      // It's a GroupedReservation
      return (
        <GroupedReservationItem
          key={`group-${item.representative.id}-${index}`}
          group={item}
          onPress={() => handleReservationPress(item.representative)}
        />
      );
    } else {
      // It's a regular Reservation
      return (
        <ReservationItem
          key={`reservation-${item.id}-${index}`}
          reservation={item}
          onPress={() => handleReservationPress(item)}
        />
      );
    }
  };

  const dataToShow: ReservationListItem[] = groupConsecutive
    ? groupConsecutiveReservations(filteredReservations)
    : filteredReservations;

  if (loading) {
    return (
      <View className="flex-1 bg-[#F5F5F5]">
        <ScreenHeader title="Lịch sử đặt sân" />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5A983B" />
          <Text className="text-gray-500 mt-2">Đang tải lịch sử...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScreenHeader
        title="Lịch sử đặt sân"
        rightIcon={groupConsecutive ? "list" : "layers"}
        onRightPress={() => setGroupConsecutive(!groupConsecutive)}
      />

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm"
            placeholder="Tìm kiếm theo sân, môn thể thao, ngày..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-4 py-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={
            [
              "ALL",
              "PENDING",
              "CONFIRMED",
              "COMPLETED",
              "CANCELLED",
            ] as FilterStatus[]
          }
          renderItem={({ item }) => renderFilterButton(item)}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Results Summary */}
      <View className="bg-white px-4 py-2 border-b border-gray-100">
        <Text className="text-sm text-gray-600">
          {filteredReservations.length > 0
            ? `Tìm thấy ${filteredReservations.length} lịch đặt`
            : "Không tìm thấy lịch đặt nào"}
          {searchQuery && ` cho "${searchQuery}"`}
        </Text>
      </View>

      {/* Reservation List */}
      {filteredReservations.length > 0 ? (
        <FlatList
          data={dataToShow}
          renderItem={renderListItem}
          keyExtractor={(item, index) =>
            "representative" in item
              ? `group-${item.representative.id}-${index}`
              : `reservation-${item.id}-${index}`
          }
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#5A983B"]}
              tintColor="#5A983B"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || filterStatus !== "ALL"
              ? "Không tìm thấy kết quả"
              : "Chưa có lịch đặt nào"}
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            {searchQuery || filterStatus !== "ALL"
              ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
              : "Bạn chưa có lịch đặt sân nào. Hãy đặt sân đầu tiên của bạn!"}
          </Text>
          {!searchQuery && filterStatus === "ALL" && (
            <TouchableOpacity
              onPress={() => router.push("/stadium-booking")}
              className="bg-primary rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Đặt sân ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Reservation Detail Modal */}
      <ReservationModal
        visible={modalVisible}
        reservation={selectedReservation}
        userRole="CUSTOMER"
        onClose={() => {
          setModalVisible(false);
          setSelectedReservation(null);
        }}
        onStatusChange={async (reservationId, newStatus) => {
          // Update local state
          setReservations((prev) =>
            prev.map((reservation) =>
              reservation.id === reservationId
                ? { ...reservation, status: newStatus }
                : reservation
            )
          );
          // Refresh data
          await fetchReservations(true);
        }}
      />
    </View>
  );
}
