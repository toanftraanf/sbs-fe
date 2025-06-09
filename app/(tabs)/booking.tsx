import DateSelector from "@/components/DateSelector";
import ReservationModal from "@/components/ReservationModal";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getStadiumReservations } from "@/services/reservation";
import { getStadiumsByUser } from "@/services/stadium";
import { Reservation, Stadium } from "@/types";
import { getTodayLocalDate, getWeekDatesForSelector } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Helper function to generate time slots from stadium operating hours
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number = 30
): string[] => {
  const slots: string[] = [];
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  let current = new Date(start);

  while (current < end) {
    const slotStart = current.toTimeString().slice(0, 5);
    current.setMinutes(current.getMinutes() + slotDuration);
    const slotEnd = current.toTimeString().slice(0, 5);

    if (current <= end) {
      slots.push(`${slotStart} - ${slotEnd}`);
    }
  }

  return slots;
};

export default function Booking() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState<"schedule" | "today">("schedule");
  const [selectedFilter, setSelectedFilter] = useState<"outdoor" | "indoor">(
    "outdoor"
  );
  const [weekDates] = useState(getWeekDatesForSelector());
  const [selectedDate, setSelectedDate] = useState(0); // Index of selected date
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);
  const [loadingStadiums, setLoadingStadiums] = useState(false);
  const [showStadiumDropdown, setShowStadiumDropdown] = useState(false);

  // Real data states
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [courts, setCourts] = useState<string[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [slotStatus, setSlotStatus] = useState<string[][]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [loadingTodayReservations, setLoadingTodayReservations] =
    useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    fetchUserStadiums();
  }, [user]);

  useEffect(() => {
    if (selectedStadium) {
      generateStadiumTimeSlots();
      generateStadiumCourts();
    }
  }, [selectedStadium, selectedFilter]);

  useEffect(() => {
    if (
      selectedStadium &&
      weekDates[selectedDate] &&
      timeSlots.length > 0 &&
      courts.length > 0
    ) {
      fetchReservationsForDate();
    }
  }, [
    selectedStadium,
    selectedDate,
    weekDates,
    selectedFilter,
    timeSlots,
    courts,
  ]);

  useEffect(() => {
    // Fetch today's reservations when stadium or filter changes, or when switching to today tab
    if (
      selectedStadium &&
      (activeTab === "today" || activeTab === "schedule")
    ) {
      fetchTodayReservations();
    }
  }, [selectedStadium, selectedFilter, activeTab]);

  const fetchUserStadiums = async () => {
    if (!user?.id) return;

    try {
      setLoadingStadiums(true);
      const userId = parseInt(user.id);
      const userStadiums = await getStadiumsByUser(userId);
      console.log("📍 User stadiums fetched:", userStadiums);

      setStadiums(userStadiums);
      // Set first stadium as default selected
      if (userStadiums.length > 0) {
        setSelectedStadium(userStadiums[0]);
      }
    } catch (error) {
      console.error("💥 Error fetching user stadiums:", error);
    } finally {
      setLoadingStadiums(false);
    }
  };

  const generateStadiumTimeSlots = () => {
    if (!selectedStadium) return;

    const startTime = selectedStadium.startTime || "07:00";
    const endTime = selectedStadium.endTime || "22:00";
    const slots = generateTimeSlots(startTime, endTime);
    setTimeSlots(slots);
    console.log(
      "⏰ Generated time slots:",
      slots.length,
      "slots from",
      startTime,
      "to",
      endTime
    );
  };

  const generateStadiumCourts = () => {
    if (!selectedStadium) return;

    // Use only actual field names from database
    if (selectedStadium.fields && selectedStadium.fields.length > 0) {
      const fields = selectedStadium.fields.map((field) => field.fieldName);
      setCourts(fields);
      console.log(
        "🏟️ Using database courts:",
        fields,
        "for filter:",
        selectedFilter
      );
    } else {
      // No fields available
      setCourts([]);
      console.log("⚠️ No fields found for this stadium");
    }
  };

  const fetchTodayReservations = async () => {
    if (!selectedStadium) {
      console.log("⚠️ Skipping fetchTodayReservations - no stadium selected");
      return;
    }

    try {
      setLoadingTodayReservations(true);
      const today = getTodayLocalDate();

      console.log("🗓️ DEBUG - Date comparison:");
      console.log("  📅 getTodayLocalDate():", today);
      console.log(
        "  📅 new Date().toISOString().split('T')[0]:",
        new Date().toISOString().split("T")[0]
      );
      console.log("  📅 Your computer date should be June 10th");

      console.log("📅 Fetching TODAY's reservations for:", {
        stadiumId: selectedStadium.id,
        stadiumName: selectedStadium.name,
        date: today,
        courtTypeFilter: selectedFilter,
        todayActual: today,
      });

      const stadiumReservations = await getStadiumReservations(
        parseInt(selectedStadium.id.toString()),
        today
      );

      console.log(
        "📦 Today's raw API response:",
        stadiumReservations.length,
        "reservations"
      );

      // Log each reservation's details
      if (stadiumReservations.length > 0) {
        console.log("📋 Today's raw reservations details:");
        stadiumReservations.forEach((res, index) => {
          console.log(
            `  ${index + 1}. ID: ${res.id}, Date: ${res.date}, Status: ${
              res.status
            }, CourtType: ${res.courtType}, StartTime: ${res.startTime}`
          );
        });
      }

      // Apply court type filter
      const filteredReservations = stadiumReservations.filter((reservation) => {
        if (!reservation.courtType) {
          console.log(
            "⚠️ Today's reservation has no courtType, including:",
            reservation.id
          );
          return true;
        }

        const courtTypeLower = reservation.courtType.toLowerCase();

        if (selectedFilter === "outdoor") {
          const isOutdoor =
            courtTypeLower.includes("outdoor") ||
            courtTypeLower.includes("ngoài trời") ||
            courtTypeLower.includes("sân ngoài") ||
            courtTypeLower === "outdoor";
          return isOutdoor;
        } else {
          const isIndoor =
            courtTypeLower.includes("indoor") ||
            courtTypeLower.includes("trong nhà") ||
            courtTypeLower.includes("sân trong") ||
            courtTypeLower === "indoor";
          return isIndoor;
        }
      });

      console.log(
        "🔍 Today's filtered reservations:",
        filteredReservations.length,
        "for",
        selectedFilter
      );

      // If no filtered reservations found, show all for debugging
      if (filteredReservations.length === 0 && stadiumReservations.length > 0) {
        console.log(
          "⚠️ No today reservations match filter, showing all for debugging"
        );
        setTodayReservations(stadiumReservations);
      } else {
        setTodayReservations(filteredReservations);
      }

      console.log(
        "✅ Today's reservations updated:",
        filteredReservations.length || stadiumReservations.length
      );
    } catch (error) {
      console.error("💥 Error fetching today's reservations:", error);
      setTodayReservations([]);
    } finally {
      setLoadingTodayReservations(false);
    }
  };

  const fetchReservationsForDate = async () => {
    if (!selectedStadium || !weekDates[selectedDate]) {
      console.log(
        "⚠️ Skipping fetchReservationsForDate - missing stadium or date"
      );
      return;
    }

    try {
      setLoadingReservations(true);
      const dateStr = weekDates[selectedDate].fullDate;
      console.log("📅 STARTING fetchReservationsForDate for:", {
        stadiumId: selectedStadium.id,
        stadiumName: selectedStadium.name,
        date: dateStr,
        selectedDateIndex: selectedDate,
        courtTypeFilter: selectedFilter,
      });

      // Clear previous reservations first
      console.log("🧹 Clearing previous reservations");
      setReservations([]);

      const stadiumReservations = await getStadiumReservations(
        parseInt(selectedStadium.id.toString()),
        dateStr
      );

      // Log all courtType values to understand the data
      console.log(
        "📦 Raw API response:",
        stadiumReservations.length,
        "total reservations"
      );
      console.log(
        "🔍 Court types in reservations:",
        stadiumReservations.map((r) => ({
          id: r.id,
          courtType: r.courtType,
          courtNumber: r.courtNumber,
        }))
      );

      // For now, let's be more inclusive with filtering to ensure reservations show up
      const filteredReservations = stadiumReservations.filter((reservation) => {
        // If no courtType data, show all reservations (temporary)
        if (!reservation.courtType) {
          console.log(
            "⚠️ No courtType found, showing reservation:",
            reservation.id
          );
          return true;
        }

        const courtTypeLower = reservation.courtType.toLowerCase();
        console.log(
          "🏟️ Checking reservation",
          reservation.id,
          "with courtType:",
          courtTypeLower
        );

        if (selectedFilter === "outdoor") {
          const isOutdoor =
            courtTypeLower.includes("outdoor") ||
            courtTypeLower.includes("ngoài trời") ||
            courtTypeLower.includes("sân ngoài") ||
            courtTypeLower === "outdoor";
          console.log("🌞 Outdoor check for", reservation.id, ":", isOutdoor);
          return isOutdoor;
        } else {
          const isIndoor =
            courtTypeLower.includes("indoor") ||
            courtTypeLower.includes("trong nhà") ||
            courtTypeLower.includes("sân trong") ||
            courtTypeLower === "indoor";
          console.log("🏠 Indoor check for", reservation.id, ":", isIndoor);
          return isIndoor;
        }
      });

      console.log(
        "🔍 Filtered reservations:",
        filteredReservations.length,
        "for",
        selectedFilter
      );

      // Temporary fallback: if no filtered reservations, show all reservations for debugging
      if (filteredReservations.length === 0 && stadiumReservations.length > 0) {
        console.log(
          "⚠️ No reservations match filter, showing all reservations for debugging"
        );
        setReservations(stadiumReservations);
      } else {
        setReservations(filteredReservations);
      }

      // Update slot status based on the reservations we're actually using
      const reservationsToUse =
        filteredReservations.length === 0 && stadiumReservations.length > 0
          ? stadiumReservations
          : filteredReservations;
      console.log(
        "🔄 About to call updateSlotStatus with",
        reservationsToUse.length,
        "reservations"
      );
      updateSlotStatus(reservationsToUse);

      console.log(
        "✅ COMPLETED fetchReservationsForDate:",
        reservationsToUse.length,
        "reservations displayed"
      );
    } catch (error) {
      console.error("💥 Error fetching reservations:", error);
      console.log("🧹 Setting empty reservations due to error");
      setReservations([]);
      // Initialize with all available slots on error
      initializeEmptySlotStatus();
    } finally {
      setLoadingReservations(false);
    }
  };

  const updateSlotStatus = (reservationData: Reservation[]) => {
    console.log("🔍 updateSlotStatus called with:", {
      reservationsCount: reservationData.length,
      reservations: reservationData,
      timeSlotsLength: timeSlots.length,
      courtsLength: courts.length,
      selectedDate: weekDates[selectedDate]?.fullDate,
      selectedFilter,
    });

    if (timeSlots.length === 0 || courts.length === 0) {
      console.log("⚠️ Skipping slot status update - no timeSlots or courts");
      return;
    }

    // Initialize all slots as available (white/unselected style)
    const status: string[][] = timeSlots.map(
      () => courts.map(() => "available") // Unbooked slots show as white/available
    );

    // Mark booked slots as selected (green style) - only for filtered reservations
    reservationData.forEach((reservation, index) => {
      const {
        courtNumber,
        startTime,
        status: reservationStatus,
        courtType,
      } = reservation;
      console.log(`🎯 Processing filtered reservation ${index + 1}:`, {
        courtNumber,
        startTime,
        status: reservationStatus,
        courtType,
        selectedFilter,
      });

      // Skip cancelled reservations
      if (reservationStatus === "CANCELLED") return;

      // Find the time slot that matches this reservation
      const slotIndex = timeSlots.findIndex((slot) => {
        const [slotStartTime] = slot.split(" - ");
        return slotStartTime === startTime;
      });

      // Find the court index (courtNumber - 1 because array is 0-indexed)
      const courtIndex = courtNumber - 1;

      console.log(`📍 Slot mapping:`, {
        slotIndex,
        courtIndex,
        slotStartTime: timeSlots[slotIndex],
        courtName: courts[courtIndex],
      });

      if (slotIndex !== -1 && courtIndex >= 0 && courtIndex < courts.length) {
        status[slotIndex][courtIndex] = "selected"; // Booked slots show as green/selected
        console.log(
          `✅ Marked slot [${slotIndex}][${courtIndex}] as selected for ${courtType} court`
        );
      }
    });

    setSlotStatus(status);
    console.log(
      "🎨 Final slot status updated with filter:",
      selectedFilter,
      status
    );

    // Additional debugging to show which slots are marked as selected
    console.log("🔍 Selected slots found:");
    status.forEach((row, rowIndex) => {
      row.forEach((slotStatus, colIndex) => {
        if (slotStatus === "selected") {
          console.log(
            `  → Slot [${rowIndex}][${colIndex}] (${timeSlots[rowIndex]} at ${courts[colIndex]}) = SELECTED`
          );
        }
      });
    });

    // Log total counts
    const totalSlots = status.flat().length;
    const selectedCount = status.flat().filter((s) => s === "selected").length;
    const availableCount = status
      .flat()
      .filter((s) => s === "available").length;
    console.log(
      `📊 Slot status summary: ${selectedCount} selected, ${availableCount} available, ${totalSlots} total`
    );
  };

  const initializeEmptySlotStatus = () => {
    if (timeSlots.length === 0 || courts.length === 0) return;

    // When no reservations, all slots are unbooked so they show as white/available
    const status: string[][] = timeSlots.map(
      () => courts.map(() => "available") // All unbooked slots show as white
    );
    setSlotStatus(status);
  };

  const hasReservationsOnDate = (dateStr: string): boolean => {
    return reservations.some((reservation) => reservation.date === dateStr);
  };

  const handleSlotPress = (rowIdx: number, colIdx: number) => {
    const currentStatus = slotStatus[rowIdx]?.[colIdx];

    // Only allow interaction with booked slots (selected status = green)
    if (currentStatus !== "selected") {
      console.log("ℹ️ Only booked slots are clickable");
      return;
    }

    // Find the reservation for this slot (from filtered reservations)
    const reservation = reservations.find((res) => {
      const slotIndex = timeSlots.findIndex((slot) => {
        const [slotStartTime] = slot.split(" - ");
        return slotStartTime === res.startTime;
      });
      const courtIndex = res.courtNumber - 1;
      return slotIndex === rowIdx && courtIndex === colIdx;
    });

    if (reservation) {
      console.log("📋 Full reservation data:", reservation);
      console.log(
        "📋 Court type:",
        reservation.courtType,
        "Selected filter:",
        selectedFilter
      );
      setSelectedReservation(reservation);
      setModalVisible(true);
      console.log(
        "📋 Opening reservation details for:",
        reservation.user?.fullName || "Unknown customer"
      );
    } else {
      console.log("❌ No reservation found for this slot");
    }
  };

  const handleStatusChange = async (
    reservationId: number,
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    try {
      console.log(
        `🔄 Updating reservation ${reservationId} status to ${newStatus}`
      );

      // Update the reservation in the local state
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );

      // Refresh the slot status display
      if (selectedStadium) {
        await fetchReservationsForDate();
      }

      console.log(`✅ Successfully updated reservation status to ${newStatus}`);
    } catch (error) {
      console.error("💥 Error updating reservation status:", error);
    }
  };

  const handleStadiumSelect = (stadium: Stadium) => {
    setSelectedStadium(stadium);
    setShowStadiumDropdown(false);
    // Reset to first date when changing stadium
    setSelectedDate(0);
    // Clear previous reservation data
    setReservations([]);
    setSlotStatus([]);
    console.log("Selected stadium:", stadium.name);
  };

  const handleFilterChange = (filter: "outdoor" | "indoor") => {
    console.log("🔄 Filter changed from", selectedFilter, "to", filter);
    setSelectedFilter(filter);
    // Clear previous data to show loading state
    setReservations([]);
    setTodayReservations([]);
    setSlotStatus([]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderHeader = () => (
    <View className="bg-gray-700 px-4 pt-12 pb-6">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          {profileLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-sm ml-2">Đang tải...</Text>
            </View>
          ) : (
            <>
              <Text className="font-bold text-xl text-white">
                {profile?.fullName || user?.phoneNumber || "User"}
              </Text>
              <TouchableOpacity
                className="flex-row items-center mt-1"
                onPress={() => setShowStadiumDropdown(!showStadiumDropdown)}
                disabled={loadingStadiums || stadiums.length === 0}
              >
                {loadingStadiums ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text className="text-base text-white" numberOfLines={1}>
                      {selectedStadium?.name || "Chọn sân"}
                    </Text>
                    <Ionicons
                      name={showStadiumDropdown ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#fff"
                      className="ml-1"
                    />
                  </>
                )}
              </TouchableOpacity>
              {selectedStadium?.address && (
                <Text
                  className="text-sm text-white opacity-75 mt-0.5"
                  numberOfLines={1}
                >
                  {selectedStadium.address}
                </Text>
              )}
            </>
          )}
        </View>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="document-text-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-primary">
            <Ionicons name="person" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab("schedule")}
          className="mr-8"
        >
          <Text
            className={`font-semibold text-base ${
              activeTab === "schedule" ? "text-primary" : "text-white"
            }`}
          >
            Lịch đặt sân
          </Text>
          {activeTab === "schedule" && (
            <View className="h-0.5 bg-primary mt-2 rounded-full" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("today")}>
          <Text
            className={`font-semibold text-base ${
              activeTab === "today" ? "text-primary" : "text-white"
            }`}
          >
            Đơn hôm nay
          </Text>
          {activeTab === "today" && (
            <View className="h-0.5 bg-primary mt-2 rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      {/* Stadium Dropdown */}
      {showStadiumDropdown && stadiums.length > 0 && (
        <View className="absolute top-full left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 mt-2">
          <ScrollView className="max-h-60">
            {stadiums.map((stadium, index) => (
              <TouchableOpacity
                key={stadium.id}
                onPress={() => handleStadiumSelect(stadium)}
                className={`px-4 py-3 flex-row items-center ${
                  index < stadiums.length - 1 ? "border-b border-gray-100" : ""
                } ${selectedStadium?.id === stadium.id ? "bg-green-50" : ""}`}
              >
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-base">
                    {stadium.name}
                  </Text>
                  {stadium.address && (
                    <Text
                      className="text-sm text-gray-500 mt-0.5"
                      numberOfLines={1}
                    >
                      {stadium.address}
                    </Text>
                  )}
                  {stadium.sports && stadium.sports.length > 0 && (
                    <Text className="text-xs text-primary mt-0.5">
                      {stadium.sports.join(", ")}
                    </Text>
                  )}
                </View>
                {selectedStadium?.id === stadium.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#7CB518" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderScheduleTab = () => (
    <ScrollView
      key="schedule-tab"
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Filter Buttons */}
      <View className="px-4 py-2">
        <View className="flex-row space-x-3 mb-2">
          <TouchableOpacity
            onPress={() => handleFilterChange("outdoor")}
            className={`px-4 py-2 rounded-full border ${
              selectedFilter === "outdoor"
                ? "bg-primary border-primary"
                : "bg-white border-gray-300"
            }`}
          >
            <Text
              className={`font-medium text-sm ${
                selectedFilter === "outdoor" ? "text-white" : "text-gray-700"
              }`}
            >
              Sân ngoài trời
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterChange("indoor")}
            className={`px-4 py-2 rounded-full border ${
              selectedFilter === "indoor"
                ? "bg-primary border-primary"
                : "bg-white border-gray-300"
            }`}
          >
            <Text
              className={`font-medium text-sm ${
                selectedFilter === "indoor" ? "text-white" : "text-gray-700"
              }`}
            >
              Sân trong nhà
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            placeholder="Tìm kiếm"
            className="flex-1 ml-2 text-sm text-gray-700"
            placeholderTextColor="#999"
          />
          <TouchableOpacity className="flex-row items-center ml-2 px-2">
            <Ionicons name="options-outline" size={14} color="#7CB518" />
            <Text className="text-primary ml-1 text-xs font-medium">
              Bộ lọc
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center ml-2 px-2">
            <Ionicons name="swap-vertical" size={14} color="#7CB518" />
            <Text className="text-primary ml-1 text-xs font-medium">
              Sắp xếp
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Section */}
      <View className="bg-white mx-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <View className="px-4 py-3 border-b border-gray-100">
          <Text className="font-bold text-base text-gray-900">
            Lịch các sân
          </Text>
        </View>

        {/* Date Selector */}
        <View className="px-4 py-3">
          <DateSelector
            dates={weekDates}
            selectedKey={selectedDate.toString()}
            onSelect={(key) => setSelectedDate(parseInt(key))}
          />
        </View>
      </View>

      {/* Time Slot Grid */}
      <View className="bg-white mx-4 rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        {loadingReservations ? (
          <View className="flex-row items-center justify-center py-8">
            <ActivityIndicator size="small" color="#7CB518" />
            <Text className="ml-2 text-gray-600">Đang tải lịch đặt...</Text>
          </View>
        ) : !selectedStadium ? (
          <View className="flex-row items-center justify-center py-8">
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#999"
            />
            <Text className="ml-2 text-gray-600">
              Vui lòng chọn sân để xem lịch đặt
            </Text>
          </View>
        ) : timeSlots.length === 0 || courts.length === 0 ? (
          <View className="flex-row items-center justify-center py-8">
            <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
            <Text className="ml-2 text-gray-600">
              Không có thông tin lịch đặt cho sân này
            </Text>
          </View>
        ) : (
          <TimeSlotGrid
            timeSlots={timeSlots}
            courts={courts}
            slotStatus={slotStatus}
            onSlotPress={handleSlotPress}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderTodayTab = () => {
    // Use the dedicated today reservations state
    const confirmedReservations = todayReservations.filter(
      (res) => res.status === "CONFIRMED"
    );
    const pendingReservations = todayReservations.filter(
      (res) => res.status === "PENDING"
    );

    // Debug logging for today tab
    console.log("🏠 RENDER TODAY TAB DEBUG:");
    console.log("  📊 Total todayReservations:", todayReservations.length);
    console.log("  ✅ Confirmed:", confirmedReservations.length);
    console.log("  ⏳ Pending:", pendingReservations.length);
    console.log("  📅 Today's date:", new Date().toISOString().split("T")[0]);

    if (todayReservations.length > 0) {
      console.log("  📋 Today reservations details:");
      todayReservations.forEach((res, index) => {
        console.log(
          `    ${index + 1}. ID: ${res.id}, Date: ${res.date}, Status: ${
            res.status
          }, Court: ${res.courtType}`
        );
      });
    } else {
      console.log("  ❌ No today reservations found");
    }

    const renderReservationItem = (reservation: Reservation, index: number) => (
      <TouchableOpacity
        key={reservation.id}
        onPress={() => {
          setSelectedReservation(reservation);
          setModalVisible(true);
        }}
        className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
      >
        {/* User Avatar */}
        <View className="w-12 h-12 rounded-lg bg-gray-200 items-center justify-center mr-3">
          {reservation.user?.fullName ? (
            <Text className="text-lg font-bold text-gray-600">
              {reservation.user.fullName.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={20} color="#9CA3AF" />
          )}
        </View>

        {/* Reservation Details */}
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-base mb-1">
            {reservation.user?.fullName || "Khách hàng"}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            {reservation.sport || "Thể thao"}:{" "}
            {reservation.courtNumber || "N/A"}
          </Text>
          <Text className="text-sm text-gray-700 font-medium">
            {reservation.startTime} - {reservation.endTime}
          </Text>
          <Text className="text-xs text-gray-500">
            Date: {new Date(reservation.date).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => {
            setSelectedReservation(reservation);
            setModalVisible(true);
          }}
          className="bg-primary rounded-lg px-3 py-2"
        >
          <Text className="text-white text-sm font-medium">
            {reservation.sport || "Chi tiết"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );

    return (
      <ScrollView
        key="today-tab"
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Filter Status */}
        <View className="mx-4 mt-4 mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="filter" size={16} color="#7CB518" />
            <Text className="ml-1 text-sm text-gray-600">
              {selectedFilter === "outdoor"
                ? "Sân ngoài trời"
                : "Sân trong nhà"}
            </Text>
            {todayReservations.length > 0 && (
              <Text className="ml-2 text-sm font-medium text-primary">
                ({todayReservations.length} đơn)
              </Text>
            )}
            {loadingTodayReservations && (
              <View className="ml-2 flex-row items-center">
                <ActivityIndicator size="small" color="#7CB518" />
                <Text className="ml-1 text-xs text-gray-600">Đang tải...</Text>
              </View>
            )}
          </View>

          {/* Debug refresh button */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={fetchTodayReservations}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">Refresh Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search and Filter Bar */}
        <View className="px-4 mb-3">
          <View className="flex-row items-center bg-white rounded-lg px-3 py-2.5 border border-gray-200">
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              placeholder="...Tìm kiếm"
              className="flex-1 ml-2 text-sm text-gray-700"
              placeholderTextColor="#999"
            />
            <TouchableOpacity className="flex-row items-center ml-2 px-2">
              <Ionicons name="options-outline" size={14} color="#7CB518" />
              <Text className="text-primary ml-1 text-xs font-medium">
                Bộ lọc
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center ml-2 px-2">
              <Ionicons name="swap-vertical" size={14} color="#7CB518" />
              <Text className="text-primary ml-1 text-xs font-medium">
                Sắp xếp
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmed Orders Section */}
        <View className="px-4 mb-4">
          <Text className="font-bold text-lg text-gray-900 mb-3">
            Đơn đã xác nhận
          </Text>
          {confirmedReservations.length > 0 ? (
            confirmedReservations.map((reservation, index) =>
              renderReservationItem(reservation, index)
            )
          ) : (
            <View className="bg-white rounded-xl p-6 items-center border border-gray-100">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2 text-center">
                Chưa có đơn đặt sân nào được xác nhận hôm nay
              </Text>
            </View>
          )}
        </View>

        {/* Pending Orders Section */}
        <View className="px-4 mb-4">
          <Text className="font-bold text-lg text-gray-900 mb-3">
            Đơn chờ xác nhận
          </Text>
          {pendingReservations.length > 0 ? (
            pendingReservations.map((reservation, index) =>
              renderReservationItem(reservation, index)
            )
          ) : (
            <View className="bg-white rounded-xl p-6 items-center border border-gray-100">
              <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2 text-center">
                Chưa có đơn đặt sân nào cần xác nhận
              </Text>
            </View>
          )}
        </View>

        {loadingTodayReservations &&
          !confirmedReservations.length &&
          !pendingReservations.length && (
            <View className="flex-row items-center justify-center py-8">
              <ActivityIndicator size="small" color="#7CB518" />
              <Text className="ml-2 text-gray-600">
                Đang tải đơn hôm nay...
              </Text>
            </View>
          )}
      </ScrollView>
    );
  };

  // Show loading screen while initial data is loading
  if (profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7CB518" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {renderHeader()}

      {/* Overlay to close dropdown when tapped outside */}
      {showStadiumDropdown && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          onPress={() => setShowStadiumDropdown(false)}
          activeOpacity={1}
        />
      )}

      <View className="flex-1">
        {activeTab === "schedule" && renderScheduleTab()}
        {activeTab === "today" && renderTodayTab()}
      </View>

      {/* Reservation Modal */}
      <ReservationModal
        visible={modalVisible}
        reservation={selectedReservation}
        onClose={() => setModalVisible(false)}
        onStatusChange={handleStatusChange}
      />
    </View>
  );
}
