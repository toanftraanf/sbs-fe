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
  Alert,
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

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    // Full name validation
    if (!fullName || fullName.trim() === "") {
      newErrors.fullName = "Vui lòng nhập tên người dùng";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Tên phải có ít nhất 2 ký tự";
    }

    // Date of birth validation
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    } else {
      const age = new Date().getFullYear() - dateOfBirth.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "Bạn phải từ 13 tuổi trở lên";
      } else if (age > 100) {
        newErrors.dateOfBirth = "Vui lòng nhập ngày sinh hợp lệ";
      }
    }

    // Gender validation
    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // Address validation
    if (!address || address.trim() === "") {
      newErrors.address = "Vui lòng nhập địa chỉ";
    } else if (address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    // Level validation
    if (!level) {
      newErrors.level = "Vui lòng chọn trình độ";
    }

    // Sports validation
    if (selectedSports.length === 0) {
      newErrors.sports = "Vui lòng chọn ít nhất một môn thể thao";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!validateFields()) {
        const firstError = Object.values(errors)[0];
        Alert.alert("Thông tin không hợp lệ", firstError);
        return;
      }

      // All validations passed, proceed to next step
      router.push({
        pathname: "/(auth)/user-information-step2",
        params: {
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth!.toISOString(),
          gender: gender!,
          address: address.trim(),
          role,
          level: level!,
          sports: JSON.stringify(selectedSports),
        },
      });
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
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
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                const newErrors = { ...errors };
                delete newErrors.fullName;
                setErrors(newErrors);
              }
            }}
            containerClassName="mb-0"
          />
          {errors.fullName && (
            <Text className="text-red-500 text-sm mt-1">{errors.fullName}</Text>
          )}
        </View>

        <View className="mb-4">
          <DatePickerField
            label="Độ tuổi"
            value={dateOfBirth}
            onChange={(date) => {
              setDateOfBirth(date);
              if (errors.dateOfBirth) {
                const newErrors = { ...errors };
                delete newErrors.dateOfBirth;
                setErrors(newErrors);
              }
            }}
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
            onChange={(value) => {
              setGender(value);
              if (errors.gender) {
                const newErrors = { ...errors };
                delete newErrors.gender;
                setErrors(newErrors);
              }
            }}
          />
          {errors.gender && (
            <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-1 font-InterSemiBold">Vị trí</Text>
          <AppTextInput
            left={
              <Ionicons name="location-outline" size={20} color="#515151" />
            }
            placeholder="Nhập địa chỉ của bạn"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) {
                const newErrors = { ...errors };
                delete newErrors.address;
                setErrors(newErrors);
              }
            }}
            containerClassName="mb-0"
          />
          {errors.address && (
            <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
          )}
        </View>

        <RoleToggle label="Tư cách" value={role} onChange={setRole} />

        <View className="mb-4">
          <PickerField
            label="Trình độ"
            value={level}
            onChange={(value) => {
              setLevel(value);
              if (errors.level) {
                const newErrors = { ...errors };
                delete newErrors.level;
                setErrors(newErrors);
              }
            }}
            options={USER_LEVEL_OPTIONS}
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
            onSportsChange={(sports) => {
              setSelectedSports(sports);
              if (errors.sports) {
                const newErrors = { ...errors };
                delete newErrors.sports;
                setErrors(newErrors);
              }
            }}
          />
          {errors.sports && (
            <Text className="text-red-500 text-sm mt-1">{errors.sports}</Text>
          )}
        </View>

        <AppButton title="Tiếp tục" filled onPress={handleContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
