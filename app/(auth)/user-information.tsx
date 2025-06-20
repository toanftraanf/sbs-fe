import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import DatePickerField from "@/components/DatePickerField";
import GenderSelector from "@/components/GenderSelector";
import MapLocationPicker from "@/components/MapLocationPicker";
import PickerField from "@/components/PickerField";
import RoleToggle from "@/components/RoleToggle";
import SportNowHeader from "@/components/SportNowHeader";
import SportsSelector from "@/components/SportsSelector";
import { useUserInformation } from "@/hooks/useUserInformation";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserInformation() {
  const hookResult = useUserInformation(1);

  const {
    // Step management
    currentStep,

    // Form data state
    fullName,
    dateOfBirth,
    gender,
    location,
    role,
    level,
    selectedSports,

    // UI state
    showLocationPicker,
    errors,
    isLoading,

    // Constants
    userLevelOptions,

    // Step 1 handlers
    handleFullNameChange,
    handleDateOfBirthChange,
    handleGenderChange,
    handleLocationSelect,
    setRole,
    handleLevelChange,
    handleSportsChange,
    handleShowLocationPicker,
    handleCloseLocationPicker,

    // Navigation
    goToNextStep,
    goToPreviousStep,

    // Step 2 data and handlers
    formattedData,
    handleComplete,
  } = hookResult;

  // Development helpers (conditionally available)
  const loadFakeData = (
    "loadFakeData" in hookResult ? hookResult.loadFakeData : undefined
  ) as (() => void) | undefined;
  const clearAllData = (
    "clearAllData" in hookResult ? hookResult.clearAllData : undefined
  ) as (() => void) | undefined;
  const isDevelopment =
    "isDevelopment" in hookResult ? hookResult.isDevelopment : false;

  // Render Step 1
  if (currentStep === 1) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SportNowHeader title="Thông tin cá nhân" showBack={true} />
        <ScrollView
          className="flex-1 px-6 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <Text className="text-center text-gray-700 mb-4 mt-2">
            Vui lòng cập nhật thêm thông tin để SportNow có thể tìm người chơi
            phù hợp với bạn
          </Text>

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
                    Load Fake Data
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

          <View className="mb-4">
            <Text className="mb-1 font-InterSemiBold">Tên người dùng</Text>
            <AppTextInput
              placeholder="Họ và tên"
              value={fullName}
              onChangeText={handleFullNameChange}
              containerClassName="mb-0"
            />
            {errors.fullName && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.fullName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <DatePickerField
              label="Độ tuổi"
              value={dateOfBirth}
              onChange={handleDateOfBirthChange}
              placeholder="Chọn ngày sinh"
              maximumDate={new Date()}
            />
            {errors.dateOfBirth && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.dateOfBirth}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <GenderSelector
              label="Giới tính"
              value={gender}
              onChange={handleGenderChange}
            />
            {errors.gender && (
              <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>
            )}
          </View>

          {/* Location field */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Vị trí
            </Text>
            <TouchableOpacity
              onPress={handleShowLocationPicker}
              className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
              activeOpacity={0.7}
            >
              <Text className={location ? "text-black" : "text-gray-400"}>
                {location ? location.address : "Chọn vị trí của bạn"}
              </Text>
              <Text className="text-gray-400">🌍</Text>
            </TouchableOpacity>
            {errors.location && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.location}
              </Text>
            )}
          </View>

          <RoleToggle label="Tư cách" value={role} onChange={setRole} />

          <View className="mb-4">
            <PickerField
              label="Trình độ"
              value={level}
              onChange={handleLevelChange}
              options={userLevelOptions}
              placeholder="Chọn trình độ của bạn"
            />
            {errors.level && (
              <Text className="text-red-500 text-sm mt-1">{errors.level}</Text>
            )}
          </View>

          <View className="mb-4">
            <SportsSelector
              label="Môn thể thao yêu thích"
              selectedSports={selectedSports}
              onSportsChange={handleSportsChange}
            />
            {errors.sports && (
              <Text className="text-red-500 text-sm mt-1">{errors.sports}</Text>
            )}
          </View>

          <AppButton title="Tiếp tục" filled onPress={goToNextStep} />
        </ScrollView>

        {/* Map Location Picker Modal */}
        <MapLocationPicker
          visible={showLocationPicker}
          onClose={handleCloseLocationPicker}
          onLocationSelect={handleLocationSelect}
          initialLocation={location}
        />
      </KeyboardAvoidingView>
    );
  }

  // Render Step 2
  return (
    <View className="flex-1 bg-white">
      <SportNowHeader title="Xác nhận thông tin" showBack={false} />
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-center text-gray-700 mb-6 mt-2">
          Vui lòng kiểm tra lại thông tin của bạn trước khi hoàn tất
        </Text>

        {/* Summary Information */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="font-InterBold text-lg mb-4 text-center">
            Thông tin cá nhân
          </Text>

          <View className="space-y-3">
            {[
              { label: "Tên", value: formattedData.fullName },
              { label: "Ngày sinh", value: formattedData.dateOfBirth },
              { label: "Giới tính", value: formattedData.gender },
              { label: "Địa chỉ", value: formattedData.address },
              { label: "Tư cách", value: formattedData.role },
              { label: "Trình độ", value: formattedData.level },
              { label: "Môn thể thao", value: formattedData.sports },
            ].map(({ label, value }) => (
              <View key={label} className="flex-row mb-1">
                <Text className="font-InterSemiBold text-gray-600 w-32 text-xs">
                  {label}:
                </Text>
                <Text className="font-InterRegular text-black flex-1 text-xs">
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton
            style={{ width: "48%" }}
            title="Quay lại chỉnh sửa"
            filled={false}
            onPress={goToPreviousStep}
            disabled={isLoading}
          />
          <AppButton
            style={{ width: "48%" }}
            title={isLoading ? "Đang lưu..." : "Hoàn tất"}
            filled
            onPress={handleComplete}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
