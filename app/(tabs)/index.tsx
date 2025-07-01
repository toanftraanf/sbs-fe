import { Ionicons } from "@expo/vector-icons";
import React from "react";

import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppHeader from "@/components/AppHeader";
import GroupedReservationItem from "@/components/GroupedReservationItem";
import PremiumPackageCard from "@/components/PremiumPackageCard";
import ReservationModal from "@/components/ReservationModal";
import { useHomeScreen } from "@/hooks/useHomeScreen";
import { router } from "expo-router";

export default function UserHomeRedirect() {
  const {
    // State
    user,
    profile,
    weekDates,
    isLoadingReservations,
    refreshing,
    modalVisible,
    selectedReservation,

    // Data helper functions
    hasReservationOnDate,
    hasStadiumReservationOnDate,
    getTodayReservationsCount,
    getTodayCustomerReservations,
    getTodayStadiumReservationsCount,
    getTodayReservations,
    getPendingReservations,
    groupConsecutiveReservations,

    // Actions
    onRefresh,
    handleReservationPress,
    handleModalClose,
    handleStatusChange,
  } = useHomeScreen();

  // Show loading screen while fetching reservations
  if (
    isLoadingReservations &&
    getTodayCustomerReservations().length === 0 &&
    getTodayReservations().length === 0
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
      <AppHeader
        title={
          profile?.fullName ||
          `User ${user?.phoneNumber?.slice(-4) || "Unknown"}`
        }
        subtitle={profile?.address || "Sân A"}
        showSearch={true}
        searchPlaceholder="Tìm kiếm"
        onDocPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />

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
                      onPress={() =>
                        handleReservationPress(group.representative)
                      }
                    />
                  )
                )}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2 text-center">
                  Chưa có đơn đặt nào hôm nay
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Pending Reservations */}
        <View className="px-5 mt-4">
          <Text className="font-InterBold text-gray-700 mb-2">
            Đang chờ xác nhận ({getPendingReservations().length})
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
                      onPress={() =>
                        handleReservationPress(group.representative)
                      }
                    />
                  )
                )}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text className="text-gray-500 mt-2 text-center">
                  Tất cả đơn đã được xử lý
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
      <AppHeader
        title={
          profile?.fullName ||
          `User ${user?.phoneNumber?.slice(-4) || "Unknown"}`
        }
        subtitle={profile?.address || "Unknown"}
        showSearch={true}
        searchPlaceholder="...Tìm kiếm"
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />

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
                    onPress={() => handleReservationPress(group.representative)}
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

        {/* Sự kiện */}
        <TouchableOpacity
          onPress={() => router.push("/events/create-event")}
          className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-[#E6F4EA]"
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
            }}
            className="w-16 h-16 rounded-xl mr-3"
          />
          <View className="flex-1">
            <Text className="font-InterBold mb-1">Sự kiện</Text>
            <Text className="text-xs text-gray-500">
              Tham gia các sự kiện và hoạt động của chúng tôi để nâng cao kỹ
              năng và trải nghiệm.
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
            Vai trò người dùng không xác định
          </Text>
        </View>
      )}

      <ReservationModal
        visible={modalVisible}
        reservation={selectedReservation}
        onClose={handleModalClose}
        onStatusChange={handleStatusChange}
      />
    </View>
  );
}
