import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import DatePickerField from "@/components/DatePickerField";
import GenderSelector from "@/components/GenderSelector";
import PickerField from "@/components/PickerField";
import RoleToggle from "@/components/RoleToggle";
import SportNowHeader from "@/components/SportNowHeader";
import SportsSelector from "@/components/SportsSelector";
import { FAKE_USER, USER_LEVEL_OPTIONS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function UserInformationStep1() {
  // DEBUG: Pre-fill with fake data - remove in production
  const [fullName, setFullName] = useState(FAKE_USER.fullName);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    FAKE_USER.dateOfBirth
  );
  const [gender, setGender] = useState<string | null>(FAKE_USER.gender);
  const [address, setAddress] = useState(FAKE_USER.address);
  const [role, setRole] = useState<"player" | "coach">(FAKE_USER.role);
  const [level, setLevel] = useState<string | null>(FAKE_USER.level);
  const [selectedSports, setSelectedSports] = useState<number[]>(
    FAKE_USER.sports
  );

  const handleContinue = () => {
    // Validate required fields
    if (!fullName || fullName.trim() === "") {
      alert("Vui lòng nhập tên người dùng");
      return;
    }

    if (!dateOfBirth) {
      alert("Vui lòng chọn ngày sinh");
      return;
    }

    if (!gender) {
      alert("Vui lòng chọn giới tính");
      return;
    }

    if (!address || address.trim() === "") {
      alert("Vui lòng nhập địa chỉ");
      return;
    }

    if (!level) {
      alert("Vui lòng chọn trình độ");
      return;
    }

    if (selectedSports.length === 0) {
      alert("Vui lòng chọn ít nhất một môn thể thao");
      return;
    }

    // All validations passed, proceed to next step
    router.push({
      pathname: "/(auth)/user-information-step2",
      params: {
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.toISOString(),
        gender,
        address: address.trim(),
        role,
        level,
        sports: JSON.stringify(selectedSports),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SportNowHeader title="Thông tin cá nhân" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Vui lòng cập nhật thêm thông tin để SportNow có thể tìm người chơi phù
          hợp với bạn
        </Text>

        <View className="mb-4">
          <Text className="mb-1 font-InterSemiBold">Tên người dùng</Text>
          <AppTextInput
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            containerClassName="mb-0"
          />
        </View>

        <DatePickerField
          label="Độ tuổi"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          placeholder="Chọn ngày sinh"
          maximumDate={new Date()}
        />

        <GenderSelector label="Giới tính" value={gender} onChange={setGender} />

        <View className="mb-4">
          <Text className="mb-1 font-InterSemiBold">Vị trí</Text>
          <AppTextInput
            left={
              <Ionicons name="location-outline" size={20} color="#515151" />
            }
            placeholder="Nhập địa chỉ của bạn"
            value={address}
            onChangeText={setAddress}
            containerClassName="mb-0"
          />
        </View>

        <RoleToggle label="Tư cách" value={role} onChange={setRole} />

        <PickerField
          label="Trình độ"
          value={level}
          onChange={setLevel}
          options={USER_LEVEL_OPTIONS}
          placeholder="Chọn trình độ của bạn"
        />

        <SportsSelector
          label="Môn thể thao yêu thích"
          selectedSports={selectedSports}
          onSportsChange={setSelectedSports}
        />

        <AppButton title="Tiếp tục" filled onPress={handleContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
