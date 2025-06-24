import AppButton from "@/components/AppButton";
import AppHeader from "@/components/AppHeader";
import AppTextInput from "@/components/AppTextInput";
import CoachPickerModal from "@/components/CoachPickerModal";
import SportsSelector from "@/components/SportsSelector";
import StadiumPickerModal from "@/components/StadiumPickerModal";
import { useEvent } from "@/hooks/useEvent";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function CreateEventScreen() {
  // Use the event hook
  const {
    formData,
    errors,
    isCreating,
    updateField,
    createEvent,
    validateForm,
    formatTime,
    formatDate,
    handleDateConfirm,
    handleStartTimeConfirm,
    handleEndTimeConfirm,
    handleStadiumSelect,
    handleCoachSelect,
    ...devHelpers
  } = useEvent();

  // Extract development helpers if available
  const loadFakeData =
    "loadFakeData" in devHelpers ? devHelpers.loadFakeData : undefined;
  const clearAllData =
    "clearAllData" in devHelpers ? devHelpers.clearAllData : undefined;
  const isDevelopment =
    "isDevelopment" in devHelpers ? devHelpers.isDevelopment : false;

  // UI state
  const [showStadiumPicker, setShowStadiumPicker] = useState(false);
  const [showCoachPicker, setShowCoachPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Refs for multiline inputs
  const descriptionRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  // Helper function to focus on multiline inputs
  const handleMultilineInputFocus = (
    ref: React.RefObject<TextInput | null>
  ) => {
    setTimeout(() => {
      if (ref.current && scrollViewRef.current) {
        ref.current.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollToPosition(0, pageY + height + 50);
        });
      }
    }, 100);
  };

  const handleCreateEvent = async () => {
    // Validate form before going to preview
    if (!validateForm()) {
      return;
    }

    // Prepare data for preview screen
    const eventDataForPreview = {
      eventTitle: formData.eventTitle,
      selectedSports: formData.selectedSports,
      eventDate: formData.eventDate?.toISOString(),
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
      selectedStadium: formData.selectedStadium,
      selectedCoach: formData.selectedCoach,
      maxParticipants: formData.maxParticipants,
      description: formData.description,
      additionalNotes: formData.additionalNotes,
      isSharedCost: formData.isSharedCost,
      isPrivate: formData.isPrivate,
    };

    // Navigate to preview screen with data
    router.push({
      pathname: "/events/event-preview",
      params: {
        eventData: JSON.stringify(eventDataForPreview),
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Tạo sự kiện" showBack={true} />

      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 200 }}
        extraHeight={250}
        extraScrollHeight={100}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableResetScrollToCoords={false}
        scrollEventThrottle={16}
        ref={scrollViewRef}
      >
        <View className="flex-1 px-6 pt-4">
          {/* General Error */}
          {errors.general && (
            <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <Text className="text-red-600 text-sm">{errors.general}</Text>
            </View>
          )}

          {/* Development Helper Buttons - Only shown in development */}
          {isDevelopment && (
            <View className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <Text className="text-yellow-800 font-semibold text-center mb-3">
                🛠 Development Tools
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={loadFakeData}
                  className="flex-1 bg-blue-500 py-2 px-4 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center font-medium">
                    Load Sample Data
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={clearAllData}
                  className="flex-1 bg-gray-500 py-2 px-4 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center font-medium">
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Event Title */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Tên sự kiện *
            </Text>
            <AppTextInput
              placeholder="Nhập tên sự kiện"
              value={formData.eventTitle}
              onChangeText={(text) => updateField("eventTitle", text)}
              containerClassName="mb-0"
            />
            {errors.eventTitle && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.eventTitle}
              </Text>
            )}
          </View>

          {/* Sports Selection */}
          <View className="mb-4">
            <SportsSelector
              label="Môn thể thao *"
              selectedSports={formData.selectedSports}
              onSportsChange={(sports) => updateField("selectedSports", sports)}
            />
            {errors.sports && (
              <Text className="text-red-500 text-sm mt-1">{errors.sports}</Text>
            )}
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 my-4 -mx-6" />

          {/* Date Selection */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Ngày *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
              activeOpacity={0.7}
            >
              <Text
                className={formData.eventDate ? "text-black" : "text-gray-400"}
              >
                {formData.eventDate
                  ? formatDate(formData.eventDate)
                  : "DD/MM/YYYY"}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            {errors.eventDate && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.eventDate}
              </Text>
            )}
          </View>

          {/* Time Selection */}
          <View className="mb-4 flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-700 mb-2">
                Giờ bắt đầu *
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
                activeOpacity={0.7}
              >
                <Text
                  className={
                    formData.startTime ? "text-black" : "text-gray-400"
                  }
                >
                  {formData.startTime
                    ? formatTime(formData.startTime)
                    : "00:00"}
                </Text>
                <Ionicons name="time" size={20} color="#666" />
              </TouchableOpacity>
              {errors.startTime && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.startTime}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-base font-medium text-gray-700 mb-2">
                Giờ kết thúc *
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
                activeOpacity={0.7}
              >
                <Text
                  className={formData.endTime ? "text-black" : "text-gray-400"}
                >
                  {formData.endTime ? formatTime(formData.endTime) : "00:00"}
                </Text>
                <Ionicons name="time" size={20} color="#666" />
              </TouchableOpacity>
              {errors.endTime && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.endTime}
                </Text>
              )}
            </View>
          </View>

          {/* Stadium Selection */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Sân tập *
            </Text>
            <TouchableOpacity
              onPress={() => setShowStadiumPicker(true)}
              className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
              activeOpacity={0.7}
            >
              <View className="flex-1">
                {formData.selectedStadium ? (
                  <View>
                    <Text className="text-black font-medium">
                      {formData.selectedStadium.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {formData.selectedStadium.address}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-400">Chọn sân tập</Text>
                )}
              </View>
              <Ionicons name="location" size={20} color="#666" />
            </TouchableOpacity>
            {errors.stadium && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.stadium}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 my-4 -mx-6" />

          {/* Section Label */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="settings-outline" size={24} color="#374151" />
            <Text className="text-base font-medium text-gray-700 ml-2">
              Thiết lập sự kiện
            </Text>
          </View>

          {/* Privacy Setting */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Quyền riêng tư
            </Text>
            <View className="flex-row bg-gray-100 rounded-xl overflow-hidden">
              <TouchableOpacity
                className={`flex-1 py-3 items-center justify-center ${
                  !formData.isPrivate ? "bg-primary" : ""
                }`}
                onPress={() => updateField("isPrivate", false)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={!formData.isPrivate ? "#fff" : "#5A983B"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    className={`font-InterBold ${
                      !formData.isPrivate ? "text-white" : "text-primary"
                    }`}
                  >
                    Công khai
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 items-center justify-center ${
                  formData.isPrivate ? "bg-primary" : ""
                }`}
                onPress={() => updateField("isPrivate", true)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={formData.isPrivate ? "#fff" : "#5A983B"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    className={`font-InterBold ${
                      formData.isPrivate ? "text-white" : "text-primary"
                    }`}
                  >
                    Chỉ được mời
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shared Cost Toggle */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-base font-medium text-gray-700">
                Chi phí chung
              </Text>
              <Switch
                value={formData.isSharedCost}
                onValueChange={(value) => updateField("isSharedCost", value)}
                trackColor={{ false: "#E5E7EB", true: "#5A983B" }}
                thumbColor={formData.isSharedCost ? "#fff" : "#5A983B"}
              />
            </View>
          </View>

          {/* Max Participants */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Số người tham gia *
            </Text>
            <AppTextInput
              placeholder="Số thành viên (bao gồm cả bạn)"
              value={formData.maxParticipants}
              onChangeText={(text) => updateField("maxParticipants", text)}
              keyboardType="numeric"
              containerClassName="mb-0"
            />
            {errors.maxParticipants && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.maxParticipants}
              </Text>
            )}
          </View>

          {/* Equipment/Description */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Dụng cụ
            </Text>
            <AppTextInput
              placeholder="Các dụng cụ sử dụng cụ thể mang, thuê chung...)"
              value={formData.description}
              onChangeText={(text) => updateField("description", text)}
              multiline
              numberOfLines={4}
              containerClassName="mb-0"
              ref={descriptionRef}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              onFocus={() => handleMultilineInputFocus(descriptionRef)}
            />
          </View>

          {/* Additional Notes */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Ghi chú
            </Text>
            <AppTextInput
              placeholder="Các lưu ý đặc biệt nội dung tôi có"
              value={formData.additionalNotes}
              onChangeText={(text) => updateField("additionalNotes", text)}
              multiline
              numberOfLines={3}
              containerClassName="mb-0"
              ref={notesRef}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
              onFocus={() => handleMultilineInputFocus(notesRef)}
            />
          </View>

          {/* Coach Section */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Huấn luyện viên
            </Text>
            {formData.selectedCoach ? (
              <View className="border border-gray-300 rounded-xl p-4">
                <View className="flex-row items-center space-x-3">
                  <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
                    {formData.selectedCoach.avatar?.url ? (
                      <Image
                        source={{ uri: formData.selectedCoach.avatar.url }}
                        className="w-full h-full"
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#6B7280" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-gray-900">
                        {formData.selectedCoach.fullName}
                      </Text>
                      {formData.selectedCoach.rating && (
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text className="text-sm text-gray-600 ml-1 font-medium">
                            {formData.selectedCoach.rating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {formData.selectedCoach.coachProfile?.hourlyRate && (
                      <Text className="text-sm text-primary font-semibold">
                        {`${formData.selectedCoach.coachProfile.hourlyRate.toLocaleString(
                          "vi-VN"
                        )}đ/giờ`}
                      </Text>
                    )}
                    {formData.selectedCoach.favoriteSports &&
                      formData.selectedCoach.favoriteSports.length > 0 && (
                        <View className="flex-row flex-wrap mt-1">
                          {formData.selectedCoach.favoriteSports
                            .slice(0, 2)
                            .map((favSport, index) => (
                              <View
                                key={index}
                                className="bg-blue-50 px-2 py-1 rounded-full mr-1"
                              >
                                <Text className="text-xs text-blue-600 font-medium">
                                  {favSport.sport.name}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowCoachPicker(true)}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={20} color="#5A983B" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowCoachPicker(true)}
                className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-8 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="person-add" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Chọn huấn luyện viên</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Create Event Button */}
          <AppButton
            style={{ marginBottom: 20 }}
            title="XEM TRƯỚC SỰ KIỆN"
            filled
            onPress={handleCreateEvent}
            disabled={isCreating}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Date and Time Pickers */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          handleDateConfirm(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        locale="vi_VN"
        textColor="#000000"
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={(time) => {
          handleStartTimeConfirm(time);
          setShowStartTimePicker(false);
        }}
        onCancel={() => setShowStartTimePicker(false)}
        is24Hour={true}
        locale="vi_VN"
        textColor="#000000"
      />

      <DateTimePickerModal
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={(time) => {
          handleEndTimeConfirm(time);
          setShowEndTimePicker(false);
        }}
        onCancel={() => setShowEndTimePicker(false)}
        is24Hour={true}
        locale="vi_VN"
        textColor="#000000"
      />

      {/* Stadium Picker Modal */}
      <StadiumPickerModal
        visible={showStadiumPicker}
        onClose={() => setShowStadiumPicker(false)}
        onStadiumSelect={handleStadiumSelect}
        selectedStadium={formData.selectedStadium}
      />

      {/* Coach Picker Modal */}
      <CoachPickerModal
        visible={showCoachPicker}
        onClose={() => setShowCoachPicker(false)}
        onCoachSelect={handleCoachSelect}
        selectedCoach={formData.selectedCoach}
      />
    </View>
  );
}
