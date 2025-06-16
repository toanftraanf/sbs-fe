import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GroupedReservationItem from "@/components/GroupedReservationItem";
import PremiumPackageCard from "@/components/PremiumPackageCard";
import ReservationModal from "@/components/ReservationModal";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getCurrentWeekDateRange,
  getOwnerStadiumReservationsByDateRange,
  getUserReservationsByDateRange,
} from "@/services/reservation";
import { Reservation } from "@/types";
import { getTodayLocalDate, getWeekDatesLocal } from "@/utils/dateUtils";

export default function UserHomeRedirect() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stadiumReservations, setStadiumReservations] = useState<Reservation[]>(
    []
  );
  const [weekDates, setWeekDates] = useState(getWeekDatesLocal());
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // Debug modal state changes
  React.useEffect(() => {
    console.log("Modal visibility changed:", modalVisible);
    console.log("Selected reservation:", selectedReservation?.id);
  }, [modalVisible, selectedReservation]);

  useEffect(() => {
    setWeekDates(getWeekDatesLocal());

    console.log("🔄 DEBUG useEffect triggered:");
    console.log("  👤 User:", user);
    console.log("  🔑 User ID:", user?.id);
    console.log("  👤 User role:", user?.role);

    // Fetch reservations when user is available
    if (user?.id) {
      if (user.role === "CUSTOMER") {
        console.log("  ✅ Calling fetchUserReservations for CUSTOMER");
        fetchUserReservations();
      } else if (user.role === "OWNER") {
        console.log("  ✅ Calling fetchStadiumReservations for OWNER");
        fetchStadiumReservations();
      }
    } else {
      console.log("  ❌ No user ID available, skipping reservation fetch");
    }
  }, [user]);

  // Function to check if a date has user reservations (for customers)
  const hasReservationOnDate = (dateStr: string) => {
    return reservations.some((reservation) => reservation.date === dateStr);
  };

  // Function to check if a date has stadium reservations (for owners)
  const hasStadiumReservationOnDate = (dateStr: string) => {
    return stadiumReservations.some(
      (reservation) => reservation.date === dateStr
    );
  };

  // Get today's reservations count for customers
  const getTodayReservationsCount = () => {
    const today = getTodayLocalDate();
    return reservations.filter((reservation) => reservation.date === today)
      .length;
  };

  // Get today's reservations for customers (all statuses)
  const getTodayCustomerReservations = () => {
    const today = getTodayLocalDate();

    console.log("🔍 DEBUG getTodayCustomerReservations:");
    console.log("  📅 Today's date from getTodayLocalDate():", today);
    console.log("  📦 Total reservations in state:", reservations.length);
    console.log("  👤 User role:", user?.role);
    console.log("  🔄 Is loading reservations:", isLoadingReservations);

    if (reservations.length > 0) {
      console.log("  📋 All reservations:");
      reservations.forEach((res, index) => {
        console.log(
          `    ${index + 1}. ID: ${res.id}, Date: "${res.date}", Status: ${
            res.status
          }`
        );
      });

      console.log("  📋 Reservation dates vs today:");
      reservations.forEach((res, index) => {
        const matches = res.date === today;
        console.log(
          `    ${index + 1}. "${res.date}" === "${today}" ? ${matches}`
        );
      });
    } else {
      console.log("  ❌ No reservations in state!");
    }

    const filteredReservations = reservations.filter(
      (reservation) => reservation.date === today
    );
    console.log(
      "  ✅ Filtered today's reservations:",
      filteredReservations.length
    );

    return filteredReservations;
  };

  // Get today's stadium reservations count for owners
  const getTodayStadiumReservationsCount = () => {
    const today = getTodayLocalDate();
    return stadiumReservations.filter(
      (reservation) => reservation.date === today
    ).length;
  };

  // Get today's confirmed reservations for owners
  const getTodayReservations = () => {
    const today = getTodayLocalDate();
    return stadiumReservations.filter(
      (reservation) => reservation.date === today
    );
  };

  // Get pending reservations for owners (all dates)
  const getPendingReservations = () => {
    return stadiumReservations.filter(
      (reservation) => reservation.status === "PENDING"
    );
  };

  // Helper function to group consecutive reservations for display
  const groupConsecutiveReservations = (reservations: Reservation[]) => {
    if (!reservations.length) return [];

    // Group by user and court first
    const groupedByUserAndCourt: { [key: string]: Reservation[] } = {};

    reservations.forEach((reservation) => {
      const key = `${reservation.userId}-${reservation.courtNumber}-${reservation.date}`;
      if (!groupedByUserAndCourt[key]) {
        groupedByUserAndCourt[key] = [];
      }
      groupedByUserAndCourt[key].push(reservation);
    });

    const displayGroups: {
      reservations: Reservation[];
      startTime: string;
      endTime: string;
      representative: Reservation;
    }[] = [];

    // For each user-court group, find consecutive time slots
    Object.values(groupedByUserAndCourt).forEach((userCourtReservations) => {
      // Sort by start time
      const sorted = [...userCourtReservations].sort((a, b) =>
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
              representative: currentGroup[0], // Use first reservation as representative
            });
            currentGroup = [reservation];
          }
        }

        // If this is the last reservation, finalize the group
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

  // Function to fetch user reservations for the current week
  const fetchUserReservations = async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingReservations(true);
      const userId = parseInt(user?.id || "0");

      const { startDate, endDate } = getCurrentWeekDateRange();

      console.log("📅 DEBUG fetchUserReservations:");
      console.log("  👤 User from context:", user);
      console.log("  🔑 Raw user ID:", user?.id);
      console.log("  🔢 Parsed user ID:", userId);
      console.log("  📅 Date range:", { startDate, endDate });
      console.log("  📅 Today's date:", getTodayLocalDate());
      console.log("  🔄 Force refresh:", forceRefresh);

      if (!userId || userId <= 0) {
        console.log("❌ Invalid user ID, cannot fetch reservations");
        setReservations([]);
        return;
      }

      console.log("🚀 Calling getUserReservationsByDateRange with:");
      console.log("  📤 userId:", userId);
      console.log("  📤 startDate:", startDate);
      console.log("  📤 endDate:", endDate);
      console.log("  📤 forceRefresh:", forceRefresh);

      const userReservations = await getUserReservationsByDateRange(
        userId, // Using the actual user ID
        startDate,
        endDate,
        forceRefresh
      );

      console.log(
        "📅 Number of reservations received:",
        userReservations.length
      );

      if (userReservations.length > 0) {
        console.log("📅 User reservations found:");
        userReservations.forEach((res, index) => {
          console.log(
            `  ${index + 1}. ID: ${res.id}, Date: "${res.date}", Stadium: ${
              res.stadium?.name
            }, Status: ${res.status}`
          );
        });
      } else {
        console.log(
          "✅ No reservations found for this user (expected for new customers)"
        );
      }

      setReservations(userReservations);
      console.log("📅 Reservations set in state successfully");
    } catch (error) {
      console.error("💥 Error fetching user reservations:", error);
      console.error("💥 Error details:", JSON.stringify(error, null, 2));
      // Keep empty array on error so UI doesn't break
      setReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Function to fetch stadium reservations for owners for the current week
  const fetchStadiumReservations = async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingReservations(true);
      const ownerId = parseInt(user?.id || "0");
      const { startDate, endDate } = getCurrentWeekDateRange();

      console.log("🏟️ Fetching owner stadium reservations for week:", {
        ownerId,
        startDate,
        endDate,
        forceRefresh,
      });

      const ownerStadiumReservations =
        await getOwnerStadiumReservationsByDateRange(
          ownerId,
          startDate,
          endDate,
          forceRefresh
        );

      setStadiumReservations(ownerStadiumReservations);
    } catch (error) {
      console.error("💥 Error fetching stadium reservations:", error);
      // Keep empty array on error so UI doesn't break
      setStadiumReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh week dates in case the date has changed
      setWeekDates(getWeekDatesLocal());

      // Refresh reservations based on user role with forceRefresh = true
      if (user?.role === "CUSTOMER") {
        await fetchUserReservations(true);
      } else if (user?.role === "OWNER") {
        await fetchStadiumReservations(true);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading screen while fetching reservations
  if (
    isLoadingReservations &&
    reservations.length === 0 &&
    stadiumReservations.length === 0
  ) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#5A983B" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </View>
    );
  }

  // If no user is logged in, this should be handled by AuthGuard
  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">
          Không tìm thấy thông tin người dùng
        </Text>
      </View>
    );
  }

  const renderOwnerView = () => (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#5A983B"]}
            tintColor="#5A983B"
          />
        }
      >
        {/* Header */}
        <View className="bg-white rounded-b-2xl px-5 pt-8 pb-4">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="font-InterBold text-base text-secondary">
                {profile?.fullName ||
                  `User ${user?.phoneNumber?.slice(-4) || "Unknown"}`}
              </Text>
              <Text className="text-xs text-gray-400">
                {profile?.address || "Sân A"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-4">
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#5A983B"
              />
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#515151"
              />
              <Ionicons
                name="person-circle-outline"
                size={28}
                color="#5A983B"
              />
            </View>
          </View>
          {/* Search */}
          <View className="bg-[#EAF6E6] rounded-xl flex-row items-center px-3 py-2 mt-2">
            <Ionicons name="search" size={18} color="#5A983B" />
            <TextInput
              placeholder="Tìm kiếm"
              placeholderTextColor="#A3A3A3"
              className="flex-1 ml-2 text-sm"
            />
          </View>
        </View>

        {/* Schedule */}
        <View className="bg-[#EAF6E6] px-5 py-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-gray-400">
              Lịch trình sân của bạn
            </Text>
            {isLoadingReservations && (
              <ActivityIndicator size="small" color="#5A983B" />
            )}
          </View>
          <View className="flex-row justify-between mb-2">
            {weekDates.map((item, idx) => {
              const hasReservation = hasStadiumReservationOnDate(item.fullDate);
              const isActive = item.isToday || hasReservation;

              return (
                <View
                  key={idx}
                  className={`items-center px-1 ${
                    isActive ? "bg-primary rounded-xl" : ""
                  }`}
                  style={isActive ? { minWidth: 40 } : {}}
                >
                  <Text
                    className={`text-xs ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {item.day}
                  </Text>
                  <Text
                    className={`text-base font-InterBold ${
                      isActive ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {item.date}
                  </Text>
                  {hasReservation && !item.isToday && (
                    <View className="w-1 h-1 bg-white rounded-full mt-1" />
                  )}
                </View>
              );
            })}
          </View>
          <Text className="text-xs text-gray-700">
            {getTodayStadiumReservationsCount() > 0
              ? `Hôm nay có ${getTodayStadiumReservationsCount()} lịch đặt sân`
              : "Không có lịch đặt sân hôm nay"}
          </Text>
        </View>

        {/* Today's Orders */}
        <View className="px-5 mt-2">
          <Text className="font-InterBold text-gray-700 mb-2">
            Đơn hôm nay ({getTodayReservations().length})
          </Text>
          <View className="h-80 bg-white rounded-xl shadow-sm">
            {getTodayReservations().length > 0 ? (
              <ScrollView
                contentContainerStyle={{ padding: 12 }}
                showsVerticalScrollIndicator={true}
                className="flex-1"
              >
                {groupConsecutiveReservations(getTodayReservations()).map(
                  (group) => (
                    <GroupedReservationItem
                      key={`today-group-${group.representative.id}`}
                      group={group}
                      onPress={() => {
                        console.log(
                          "OWNER - Today reservation pressed:",
                          group.representative.id
                        );
                        setSelectedReservation(group.representative);
                        setModalVisible(true);
                      }}
                    />
                  )
                )}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2 text-center">
                  Chưa có đơn đặt sân nào được xác nhận hôm nay
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Pending Orders */}
        <View className="px-5 mt-2">
          <Text className="font-InterBold text-gray-700 mb-2">
            Đơn chờ xác nhận ({getPendingReservations().length})
          </Text>
          <View className="h-80 bg-white rounded-xl shadow-sm">
            {getPendingReservations().length > 0 ? (
              <ScrollView
                contentContainerStyle={{ padding: 12 }}
                showsVerticalScrollIndicator={true}
                className="flex-1"
              >
                {groupConsecutiveReservations(getPendingReservations()).map(
                  (group) => (
                    <GroupedReservationItem
                      key={`pending-group-${group.representative.id}`}
                      group={group}
                      onPress={() => {
                        console.log(
                          "OWNER - Pending reservation pressed:",
                          group.representative.id
                        );
                        setSelectedReservation(group.representative);
                        setModalVisible(true);
                      }}
                    />
                  )
                )}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons name="time-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2 text-center">
                  Chưa có đơn đặt sân nào cần xác nhận
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderCustomerView = () => (
    <View className="flex-1 bg-white">
      {/* Green Header */}
      <View style={{ backgroundColor: "#E6F4EA" }}>
        <View className="flex-row items-center justify-between px-4 pt-10 pb-2">
          <View>
            <Text className="font-InterBold text-lg">
              {profile?.fullName ||
                `User ${user?.phoneNumber?.slice(-4) || "Unknown"}`}
            </Text>
            <Text className="text-xs text-gray-500">
              {profile?.address || "Unknown"}
            </Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <Ionicons name="notifications-outline" size={24} color="#222" />
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#222"
            />
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </View>
        </View>
        {/* Search */}
        <View className="flex-row items-center bg-[#F2F8F6] rounded-xl px-3 py-2 mx-4 mb-2">
          <Ionicons name="search" size={20} color="#B0B0B0" />
          <TextInput
            className="flex-1 ml-2 text-sm"
            placeholder="...Tìm kiếm"
            placeholderTextColor="#B0B0B0"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#5A983B"]}
            tintColor="#5A983B"
          />
        }
      >
        {/* Lịch trình của bạn */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#E6F4EA]">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-InterBold">Lịch trình của bạn</Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-400 mr-2">
                {new Date().toLocaleDateString("vi-VN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              {isLoadingReservations && (
                <ActivityIndicator size="small" color="#5A983B" />
              )}
            </View>
          </View>
          <View className="flex-row justify-between mb-2">
            {weekDates.map((item, idx) => {
              const hasReservation = hasReservationOnDate(item.fullDate);
              const isActive = item.isToday || hasReservation;

              return (
                <View key={idx} className="items-center">
                  <Text
                    className={`text-xs ${
                      isActive ? "text-primary font-bold" : "text-gray-500"
                    }`}
                  >
                    {item.day}
                  </Text>
                  <Text
                    className={`text-base ${
                      isActive ? "text-primary font-bold" : "text-gray-700"
                    }`}
                  >
                    {item.date}
                  </Text>
                  {hasReservation && (
                    <View className="w-1 h-1 bg-primary rounded-full mt-1" />
                  )}
                </View>
              );
            })}
          </View>
          <Text className="text-xs text-gray-400">
            {getTodayReservationsCount() > 0
              ? `Hôm nay có ${getTodayReservationsCount()} lịch đặt`
              : "Không có lịch.."}
          </Text>
        </View>

        {/* Today's Reservations */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#E6F4EA]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-InterBold text-gray-700">
              Lịch đặt hôm nay ({getTodayCustomerReservations().length})
            </Text>
            {isLoadingReservations && (
              <ActivityIndicator size="small" color="#5A983B" />
            )}
          </View>

          <View className="h-64 bg-gray-50 rounded-xl">
            {getTodayCustomerReservations().length > 0 ? (
              <ScrollView
                contentContainerStyle={{ padding: 12 }}
                showsVerticalScrollIndicator={true}
                className="flex-1"
              >
                {groupConsecutiveReservations(
                  getTodayCustomerReservations()
                ).map((group) => (
                  <GroupedReservationItem
                    key={`customer-today-group-${group.representative.id}`}
                    group={group}
                    onPress={() => {
                      console.log(
                        "CUSTOMER - Today reservation pressed:",
                        group.representative.id
                      );
                      setSelectedReservation(group.representative);
                      setModalVisible(true);
                    }}
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2 text-center">
                  Chưa có lịch đặt sân nào hôm nay
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Hoạt động gần đây */}
        <TouchableOpacity className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-[#E6F4EA]">
          <Ionicons name="refresh-circle" size={28} color="#4CAF50" />
          <View className="ml-3">
            <Text className="font-InterSemiBold text-gray-700">
              Hoạt động gần đây
            </Text>
            <Text className="text-xs text-gray-400">
              Lịch trình và hoạt động gần đây của bạn
            </Text>
          </View>
        </TouchableOpacity>

        {/* Gói PREMIUM */}
        <PremiumPackageCard className="mb-3" />

        {/* Tìm và ghép đội */}
        <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-[#E6F4EA]">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
            }}
            className="w-16 h-16 rounded-xl mr-3"
          />
          <View className="flex-1">
            <Text className="font-InterBold mb-1">Tìm và ghép đội</Text>
            <Text className="text-xs text-gray-500">
              Tìm kiếm, ghép đội và kết nối với những người cùng đam mê với bạn
              ngay lúc này.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Thành tựu & Nhóm */}
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 mr-2 items-center shadow-sm border border-[#E6F4EA]">
            <Ionicons name="trophy-outline" size={28} color="#4CAF50" />
            <Text className="font-InterBold mt-2">Thành tựu</Text>
            <Text className="text-xs text-gray-500">Huy hiệu của bạn</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 ml-2 items-center shadow-sm border border-[#E6F4EA]">
            <Ionicons name="people-outline" size={28} color="#4CAF50" />
            <Text className="font-InterBold mt-2">Nhóm</Text>
            <Text className="text-xs text-gray-500">Nhóm của bạn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1">
      {user?.role === "OWNER" && renderOwnerView()}
      {user?.role === "CUSTOMER" && renderCustomerView()}

      {/* Default fallback for unknown roles */}
      {!user?.role && (
        <View className="flex-1 justify-center items-center bg-white">
          <Text className="text-gray-600">
            Không xác định được vai trò người dùng
          </Text>
        </View>
      )}

      {/* Reservation Detail Modal - Outside all conditional rendering */}
      {(() => {
        console.log("🔄 MODAL PROPS DEBUG:", {
          modalVisible,
          hasSelectedReservation: !!selectedReservation,
          selectedReservationId: selectedReservation?.id,
          userFromContext: user,
          userRole: user?.role,
          userRoleType: typeof user?.role,
          userRoleCasted: user?.role as "OWNER" | "CUSTOMER",
        });
        return null;
      })()}
      <ReservationModal
        visible={modalVisible}
        reservation={selectedReservation}
        userRole={user?.role as "OWNER" | "CUSTOMER"}
        onClose={() => {
          console.log("Modal closing");
          setModalVisible(false);
          setSelectedReservation(null);
        }}
        onStatusChange={async (reservationId, newStatus) => {
          try {
            // Update the reservation status in the local state
            if (user?.role === "OWNER") {
              setStadiumReservations((prev) =>
                prev.map((reservation) =>
                  reservation.id === reservationId
                    ? { ...reservation, status: newStatus }
                    : reservation
                )
              );
              // Refresh owner data with forceRefresh
              await fetchStadiumReservations(true);
            } else {
              setReservations((prev) =>
                prev.map((reservation) =>
                  reservation.id === reservationId
                    ? { ...reservation, status: newStatus }
                    : reservation
                )
              );
              // Refresh customer data with forceRefresh
              await fetchUserReservations(true);
            }

            // Close the modal
            setModalVisible(false);
            setSelectedReservation(null);
          } catch (error) {
            console.error("Error updating reservation status:", error);
          }
        }}
      />
    </View>
  );
}
