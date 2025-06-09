import AppButton from "@/components/AppButton";
import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CourtTypeSelector from "../../components/CourtTypeSelector";
import DateSelector from "../../components/DateSelector";
import StadiumSports from "../../components/StadiumSports";
import TimeSlotGrid from "../../components/TimeSlotGrid";

import {
  CREATE_RESERVATION,
  GET_STADIUM_BY_ID,
  GET_STADIUM_RESERVATIONS,
} from "../../graphql";
import { Stadium } from "../../types";

const sports = [
  { key: "tennis", label: "Quần vợt", enabled: true },
  { key: "badminton", label: "Cầu lông", enabled: false },
  { key: "tabletennis", label: "Bóng bàn", enabled: true },
  { key: "pickleball", label: "Pickleball", enabled: false },
];
const courtTypes = [
  { key: "indoor", label: "Trong nhà" },
  { key: "outdoor", label: "Ngoài trời" },
];
const generateDates = (days: number = 7) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Use timezone-aware date formatting instead of toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const localDateString = `${year}-${month}-${day}`;

    dates.push({
      key: localDateString, // Local date: YYYY-MM-DD
      day: date.toLocaleDateString("vi-VN", { weekday: "long" }),
      date: date.getDate().toString(),
      month: `Tháng ${date.getMonth() + 1}`,
    });
  }
  return dates;
};

const generateTimeSlots = (startTime: string, endTime: string) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let currentTime = new Date();
  currentTime.setHours(startHour, startMinute, 0, 0);
  const endDateTime = new Date();
  endDateTime.setHours(endHour, endMinute, 0, 0);
  while (currentTime < endDateTime) {
    const nextTime = new Date(currentTime.getTime() + 30 * 60000);
    slots.push(
      `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}` +
        " - " +
        `${nextTime.getHours().toString().padStart(2, "0")}:${nextTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
    );
    currentTime = nextTime;
  }
  return slots;
};

export default function BookingDetail() {
  const params = useLocalSearchParams();
  const stadiumId = params.stadiumId;
  const apolloClient = useApolloClient();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [fieldList, setFieldList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState(sports[0].key);
  const [selectedDateKey, setSelectedDateKey] = useState(
    generateDates()[0]?.key || ""
  );
  const [selectedCourtType, setSelectedCourtType] = useState(courtTypes[0].key);
  const [slotStatus, setSlotStatus] = useState<string[][]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [createReservation] = useMutation(CREATE_RESERVATION);
  const [getStadiumReservations, { loading: reservationsLoading }] =
    useLazyQuery(GET_STADIUM_RESERVATIONS);

  const dates = generateDates();
  const timeSlots = stadium
    ? generateTimeSlots(
        stadium.startTime || "05:00",
        stadium.endTime || "21:00"
      )
    : [];

  useEffect(() => {
    fetchStadiumDetails();
  }, [stadiumId]);

  useEffect(() => {
    if (stadium && selectedDateKey) {
      fetchReservationsAndUpdateSlots();
    }
  }, [stadium, selectedDateKey]);

  const fetchStadiumDetails = async () => {
    try {
      setLoading(true);
      const { data, errors } = await apolloClient.query({
        query: GET_STADIUM_BY_ID,
        variables: { id: parseInt(stadiumId as string) },
      });
      if (errors)
        throw new Error(
          errors[0]?.message || "Failed to fetch stadium details"
        );
      if (!data?.stadium) throw new Error("Stadium not found");

      setStadium(data.stadium);

      // Set field list from stadium data or generate default names
      if (data.stadium.fields && data.stadium.fields.length > 0) {
        const fields = data.stadium.fields.map((field: any) => field.fieldName);
        setFieldList(fields);
      } else if (
        data.stadium.numberOfFields &&
        data.stadium.numberOfFields > 0
      ) {
        // Generate field names based on numberOfFields
        const generatedFields = Array.from(
          { length: data.stadium.numberOfFields },
          (_, i) => `Sân ${i + 1}`
        );
        setFieldList(generatedFields);
      } else {
        // Default fallback
        setFieldList(["Sân 1", "Sân 2"]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin sân bóng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationsAndUpdateSlots = async () => {
    try {
      const { data } = await getStadiumReservations({
        variables: {
          stadiumId: parseInt(stadiumId as string),
          date: selectedDateKey,
        },
      });

      if (stadium) {
        const slots = generateTimeSlots(
          stadium.startTime || "05:00",
          stadium.endTime || "21:00"
        );

        // Initialize all slots as available
        const status: string[][] = slots.map(() =>
          fieldList.map(() => "available")
        );

        // Mark booked slots as locked
        if (data?.stadiumReservations) {
          data.stadiumReservations.forEach((reservation: any) => {
            const {
              courtNumber,
              startTime,
              endTime,
              status: reservationStatus,
            } = reservation;

            // Skip cancelled reservations
            if (reservationStatus === "CANCELLED") return;

            // Find the time slot that matches this reservation
            const slotIndex = slots.findIndex((slot) => {
              const [slotStartTime] = slot.split(" - ");
              return slotStartTime === startTime;
            });

            // Find the court index (courtNumber - 1 because array is 0-indexed)
            const courtIndex = courtNumber - 1;

            if (
              slotIndex !== -1 &&
              courtIndex >= 0 &&
              courtIndex < fieldList.length
            ) {
              status[slotIndex][courtIndex] = "lock";
            }
          });
        }

        setSlotStatus(status);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      // Initialize with default available slots if fetching fails
      if (stadium) {
        const slots = generateTimeSlots(
          stadium.startTime || "05:00",
          stadium.endTime || "21:00"
        );
        const status: string[][] = slots.map(() =>
          fieldList.map(() => "available")
        );
        setSlotStatus(status);
      }
    }
  };

  const handleSlotPress = (rowIdx: number, colIdx: number) => {
    setSlotStatus((prev) =>
      prev.map((row, r) =>
        row.map((status, c) => {
          if (r === rowIdx && c === colIdx) {
            if (status === "available") return "selected";
            if (status === "selected") return "available";
            // Don't change locked slots
          }
          return status;
        })
      )
    );
  };

  const getSelectedSlots = () => {
    const selectedSlots: {
      timeSlot: string;
      courtNumber: number;
      startTime: string;
      endTime: string;
    }[] = [];

    slotStatus.forEach((row, rowIdx) => {
      row.forEach((status, colIdx) => {
        if (status === "selected") {
          const timeSlot = timeSlots[rowIdx];
          const [startTime, endTime] = timeSlot.split(" - ");
          selectedSlots.push({
            timeSlot,
            courtNumber: colIdx + 1,
            startTime,
            endTime,
          });
        }
      });
    });

    return selectedSlots;
  };

  const calculateTotalPrice = () => {
    const selectedSlots = getSelectedSlots();
    const pricePerSlot = stadium?.price || 100000; // Default price
    return selectedSlots.length * pricePerSlot;
  };

  const handleCompleteBooking = async () => {
    const selectedSlots = getSelectedSlots();

    if (selectedSlots.length === 0) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn ít nhất một khung giờ để đặt sân."
      );
      return;
    }

    // For now, we'll assume userId = 1 (you should get this from user context/auth)
    const userId = 1;
    const selectedDate = dates.find((d) => d.key === selectedDateKey);

    if (!selectedDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày đặt sân.");
      return;
    }

    // Debug timezone fix
    console.log("🗓️ TIMEZONE DEBUG - Reservation Creation:");
    console.log("  📅 Local computer date:", new Date().toDateString());
    console.log("  📅 Selected date key (local):", selectedDate.key);
    console.log(
      "  📅 UTC date would be:",
      new Date().toISOString().split("T")[0]
    );
    console.log("  ✅ Using LOCAL date for reservation:", selectedDate.key);

    setBookingLoading(true);

    try {
      // Create reservations for each selected slot
      const reservationPromises = selectedSlots.map(async (slot) => {
        return createReservation({
          variables: {
            createReservationInput: {
              userId,
              stadiumId: parseInt(stadiumId as string),
              sport: selectedSport,
              courtType: selectedCourtType,
              courtNumber: slot.courtNumber,
              date: selectedDate.key, // Now using timezone-aware local date
              startTime: slot.startTime,
              endTime: slot.endTime,
              totalPrice: stadium?.price || 100000,
              status: "PENDING",
            },
          },
        });
      });

      await Promise.all(reservationPromises);

      // Redirect to success screen with booking details
      router.push({
        pathname: "/stadium-booking/booking-success",
        params: {
          stadiumName: stadium?.name || "Sân thể thao",
          selectedSlots: JSON.stringify(selectedSlots),
          totalPrice: calculateTotalPrice().toString(),
          selectedSport:
            sports.find((s) => s.key === selectedSport)?.label || selectedSport,
          selectedDate: `${selectedDate.day}, ${selectedDate.date} ${selectedDate.month}`,
          courtType: selectedCourtType,
        },
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      Alert.alert(
        "Lỗi đặt sân",
        error.message || "Không thể đặt sân. Vui lòng thử lại."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Header */}
      <View className="w-full h-32 relative border-b-primary border-b-2">
        <View className="flex-row items-center justify-center mt-16">
          <TouchableOpacity
            className="absolute left-4"
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={40}
              color="#7CB518"
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-primary">Đặt Lịch</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7CB518" />
        </View>
      ) : stadium ? (
        <ScrollView
          className="flex-1 bg-gray-100"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Sport selection */}
          <View className="px-4 pt-4 pb-2">
            <Text className="font-medium text-[#444] mb-2">Môn thể thao</Text>
            <StadiumSports
              sports={sports.map(({ key, label }) => ({ key, label }))}
              onSelect={(key) => setSelectedSport(key)}
            />
          </View>

          {/* Date selector */}
          <View className="px-4 mb-2">
            <Text className="font-medium text-[#444] mb-2">Lịch các sân</Text>
            <DateSelector
              dates={dates}
              selectedKey={selectedDateKey}
              onSelect={(key) => {
                setSelectedDateKey(key);
                // Clear current selections when date changes
                if (stadium) {
                  const slots = generateTimeSlots(
                    stadium.startTime || "05:00",
                    stadium.endTime || "21:00"
                  );
                  const defaultStatus: string[][] = slots.map(() =>
                    fieldList.map(() => "available")
                  );
                  setSlotStatus(defaultStatus);
                }
              }}
            />
          </View>

          {/* Court type selector */}
          <View className="px-4 mb-2">
            <Text className="font-medium text-[#444] mb-2">Loại sân</Text>
            <CourtTypeSelector
              courtTypes={courtTypes}
              selectedKey={selectedCourtType}
              onSelect={setSelectedCourtType}
            />
          </View>

          {/* Time slot/court grid */}
          <View className="bg-white rounded-xl mx-2 mb-4 pb-2 pt-2">
            {reservationsLoading && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#7CB518" />
                <Text className="text-xs text-gray-500 mt-2">
                  Đang tải lịch đặt sân...
                </Text>
              </View>
            )}
            <TimeSlotGrid
              timeSlots={generateTimeSlots(
                stadium.startTime || "05:00",
                stadium.endTime || "21:00"
              )}
              courts={fieldList}
              slotStatus={slotStatus}
              onSlotPress={handleSlotPress}
            />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">
            Không tìm thấy thông tin sân tập
          </Text>
        </View>
      )}

      {/* Footer buttons */}
      <View className="bg-white border-t border-gray-200 p-4">
        {/* Booking summary */}
        {getSelectedSlots().length > 0 && (
          <View className="mb-3 p-3 bg-gray-50 rounded-lg">
            <Text className="text-sm text-gray-600 mb-1">
              Đã chọn: {getSelectedSlots().length} khung giờ
            </Text>
            <Text className="text-lg font-bold text-primary">
              Tổng tiền: {calculateTotalPrice().toLocaleString("vi-VN")} VNĐ
            </Text>
          </View>
        )}

        <View className="flex-row space-x-2">
          <View className="flex-1 mr-2">
            <AppButton
              title="Hủy bỏ"
              filled={false}
              onPress={() => router.back()}
            />
          </View>
          <View className="flex-1">
            <AppButton
              title={bookingLoading ? "Đang xử lý..." : "Hoàn tất"}
              onPress={handleCompleteBooking}
              disabled={bookingLoading || getSelectedSlots().length === 0}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
