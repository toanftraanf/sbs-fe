import AppButton from "@/components/AppButton";
import AppHeader from "@/components/AppHeader";
import { useEvent } from "@/hooks/useEvent";
import { Coach, Stadium } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EventPreviewData {
  eventTitle: string;
  selectedSports: number[];
  eventDate: string; // ISO string
  startTime: string; // ISO string
  endTime: string; // ISO string
  selectedStadium: Stadium;
  selectedCoach?: Coach;
  maxParticipants: string;
  description?: string;
  additionalNotes?: string;
  isSharedCost: boolean;
  isPrivate: boolean;
}

export default function EventPreviewScreen() {
  const params = useLocalSearchParams();
  const { createEventWithData, formatTime, formatDate } = useEvent();
  const [isCreating, setIsCreating] = React.useState(false);

  // Parse the event data from params
  const eventData: EventPreviewData = React.useMemo(() => {
    try {
      return JSON.parse(params.eventData as string);
    } catch (error) {
      console.error("Error parsing event data:", error);
      // Navigate back if data is invalid
      router.back();
      return {} as EventPreviewData;
    }
  }, [params.eventData]);

  const handleConfirmCreate = async () => {
    setIsCreating(true);
    try {
      // Convert string dates back to Date objects for the API call
      const formDataForAPI = {
        ...eventData,
        eventDate: new Date(eventData.eventDate),
        startTime: new Date(eventData.startTime),
        endTime: new Date(eventData.endTime),
        selectedCoach: eventData.selectedCoach || null,
        description: eventData.description || "",
        additionalNotes: eventData.additionalNotes || "",
      };

      const success = await createEventWithData(formDataForAPI);
      if (success) {
        // Navigate to success screen
        router.replace("/events/event-success");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo sự kiện. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditEvent = () => {
    router.back();
  };

  const getSportsText = () => {
    if (!eventData.selectedSports || eventData.selectedSports.length === 0) {
      return "Chưa chọn môn thể thao";
    }

    // Map sport IDs to names
    const sportNames = eventData.selectedSports.map((id) => {
      switch (id) {
        case 1:
          return "Cầu lông";
        case 2:
          return "Tennis";
        case 3:
          return "Bóng bàn";
        case 4:
          return "Bóng đá";
        case 5:
          return "Bóng chuyền";
        case 6:
          return "Bóng rổ";
        default:
          return `Môn thể thao ${id}`;
      }
    });

    return sportNames.join(", ");
  };

  const calculateCoachPricing = () => {
    if (
      !eventData.selectedCoach?.coachProfile?.hourlyRate ||
      !eventData.startTime ||
      !eventData.endTime
    ) {
      return null;
    }

    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60); // Convert to hours

    // Coach's hourlyRate is per half hour, so multiply by 2 to get full hour rate
    const fullHourRate = eventData.selectedCoach.coachProfile.hourlyRate * 2;
    const totalPrice = fullHourRate * durationHours;

    const participants = parseInt(eventData.maxParticipants) || 1;
    const pricePerPerson = eventData.isSharedCost
      ? totalPrice / participants
      : totalPrice;

    return {
      totalPrice,
      pricePerPerson,
      durationHours,
    };
  };

  const InfoRow = ({
    icon,
    label,
    value,
    valueStyle = "text-gray-900",
  }: {
    icon: string;
    label: string;
    value: string | React.ReactNode;
    valueStyle?: string;
  }) => (
    <View className="flex-row items-start py-3 border-b border-gray-100 last:border-b-0">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon as any} size={20} color="#6B7280" />
        <Text className="text-gray-600 ml-3 font-medium">{label}</Text>
      </View>
      <View className="flex-2 ml-4">
        {typeof value === "string" ? (
          <Text className={`${valueStyle} font-medium`}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );

  // Show loading or error if no data
  if (!eventData.eventTitle) {
    return (
      <View className="flex-1 bg-white">
        <AppHeader title="Xem trước sự kiện" showBack={true} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Không có dữ liệu sự kiện</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Vui lòng kiểm tra thông tin" />

      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Event Title Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {eventData.eventTitle}
          </Text>
          <View className="flex-row items-center">
            <View
              className={`px-3 py-1 rounded-full ${
                eventData.isPrivate ? "bg-orange-100" : "bg-green-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  eventData.isPrivate ? "text-orange-700" : "text-green-700"
                }`}
              >
                {eventData.isPrivate ? "Chỉ được mời" : "Công khai"}
              </Text>
            </View>
            {eventData.isSharedCost && (
              <View className="px-3 py-1 rounded-full bg-blue-100 ml-2">
                <Text className="text-sm font-medium text-blue-700">
                  Chi phí chung
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Basic Information */}
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </Text>

          <InfoRow
            icon="basketball"
            label="Môn thể thao"
            value={getSportsText()}
            valueStyle="text-primary"
          />

          <InfoRow
            icon="calendar"
            label="Ngày tổ chức"
            value={formatDate(new Date(eventData.eventDate))}
          />

          <InfoRow
            icon="time"
            label="Thời gian"
            value={`${formatTime(new Date(eventData.startTime))} - ${formatTime(
              new Date(eventData.endTime)
            )}`}
          />

          <InfoRow
            icon="people"
            label="Số người tham gia"
            value={`${eventData.maxParticipants} người`}
          />

          {/* Coach Pricing Information */}
          {(() => {
            const pricing = calculateCoachPricing();
            if (!pricing || !eventData.selectedCoach) return null;

            return (
              <>
                <InfoRow
                  icon="cash"
                  label="Chi phí huấn luyện viên"
                  value={`${pricing.totalPrice.toLocaleString(
                    "vi-VN"
                  )}đ (${pricing.durationHours.toFixed(1)} giờ)`}
                />
                {eventData.isSharedCost && (
                  <InfoRow
                    icon="people-circle"
                    label="Chi phí mỗi người"
                    value={
                      <Text className="text-primary font-bold">
                        {Math.ceil(pricing.pricePerPerson).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </Text>
                    }
                  />
                )}
              </>
            );
          })()}
        </View>

        {/* Location */}
        {eventData.selectedStadium && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Địa điểm
            </Text>

            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold">
                  {eventData.selectedStadium.name}
                </Text>
                <Text className="text-gray-600 mt-1">
                  {eventData.selectedStadium.address}
                </Text>
                {eventData.selectedStadium.phone && (
                  <Text className="text-gray-500 text-sm mt-1">
                    📞 {eventData.selectedStadium.phone}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Coach */}
        {eventData.selectedCoach && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Huấn luyện viên
            </Text>

            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
                {eventData.selectedCoach.avatar?.url ? (
                  <Image
                    source={{ uri: eventData.selectedCoach.avatar.url }}
                    className="w-full h-full"
                  />
                ) : (
                  <Ionicons name="person" size={24} color="#6B7280" />
                )}
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold">
                  {eventData.selectedCoach.fullName}
                </Text>
                {eventData.selectedCoach.coachProfile?.hourlyRate && (
                  <Text className="text-primary font-medium">
                    {eventData.selectedCoach.coachProfile.hourlyRate.toLocaleString(
                      "vi-VN"
                    )}
                    đ/30 phút
                  </Text>
                )}
                <View className="flex-row items-center mt-1">
                  {eventData.selectedCoach.rating ? (
                    <>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {eventData.selectedCoach.rating.toFixed(1)}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-500 text-sm">
                      Chưa có đánh giá
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {eventData.description && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Dụng cụ
            </Text>
            <Text className="text-gray-700 leading-6">
              {eventData.description}
            </Text>
          </View>
        )}

        {/* Additional Notes */}
        {eventData.additionalNotes && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Ghi chú
            </Text>
            <Text className="text-gray-700 leading-6">
              {eventData.additionalNotes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="pb-8 pt-4">
          <AppButton
            title={isCreating ? "ĐANG TẠO..." : "XÁC NHẬN TẠO SỰ KIỆN"}
            filled
            onPress={handleConfirmCreate}
            disabled={isCreating}
            style={{ marginBottom: 16 }}
          />

          <TouchableOpacity
            onPress={handleEditEvent}
            className="border border-gray-300 rounded-xl py-4 items-center"
            disabled={isCreating}
          >
            <Text className="text-gray-700 font-semibold">
              CHỈNH SỬA SỰ KIỆN
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
