// app/(auth)/coach-information.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import SportNowHeader from "@/components/SportNowHeader";
import SportsSelector from "@/components/SportsSelector";
import Toggle from "@/components/Toggle";

type Params = { personal: string };

export default function CoachInformation() {
  const router = useRouter();
  const { personal } = useLocalSearchParams<Params>();
  const personalData = personal ? JSON.parse(personal) : null;

  // --- Early bail if no personal data ---
  useEffect(() => {
    if (!personalData) {
      Alert.alert("Lỗi", "Thiếu thông tin cá nhân");
      router.replace("/(auth)/user-information");
    }
  }, []);

  // --- Coach state ---
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [rates, setRates] = useState<Record<number,string>>({});
  const [yearsOfExp, setYearsOfExp] = useState("");
  const [certifications, setCertifications] = useState("");
  const [minDur, setMinDur] = useState("");
  const [maxDur, setMaxDur] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [errors, setErrors] = useState<Record<string,string>>({});

  // --- Validate coach ---
  const validate = () => {
    const e: Record<string,string> = {};
    if (!bio.trim()) e.bio = "Nhập phần giới thiệu";
    if (!phone.trim()) e.phone = "Nhập số điện thoại";
    if (selectedSports.length === 0) e.sports = "Chọn ít nhất 1 môn";
    selectedSports.forEach((sid) => {
      const v = rates[sid];
      if (!v || isNaN(+v) || +v <= 0) {
        e[`rate_${sid}`] = "Giá phải > 0";
      }
    });
    if (!yearsOfExp || isNaN(+yearsOfExp))
      e.yearsOfExp = "Nhập năm kinh nghiệm";
    if (!minDur || isNaN(+minDur)) e.minDur = "Nhập thời gian tối thiểu";
    if (!maxDur || isNaN(+maxDur)) e.maxDur = "Nhập thời gian tối đa";
    setErrors(e);
    return !Object.keys(e).length;
  };

  // --- Submit both personal + coach ---
  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert("Thông tin chưa hợp lệ", Object.values(errors)[0]);
      return;
    }
    const coachData = {
      ...personalData,
      coachProfile: {
        bio,
        phone,
        sports: selectedSports,
        rates: selectedSports.map((sid) => ({
          sportId: sid,
          price: +rates[sid],
        })),
        yearsOfExp: +yearsOfExp,
        certifications: certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        minSessionDuration: +minDur,
        maxSessionDuration: +maxDur,
        isAvailable,
      },
    };
    console.log("▶️ Combined Data:", coachData);
    // sau này gọi authService.createCoach( coachData ) ...
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SportNowHeader
        title="Thông tin huấn luyện viên"
        showBack
      />
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-center text-gray-700 mb-4">
          Điền chi tiết hồ sơ huấn luyện viên
        </Text>

        {/* Giới thiệu */}
        <View className="mb-4">
          <Text className="font-InterSemiBold mb-1">Giới thiệu</Text>
          <AppTextInput
            multiline
            numberOfLines={4}
            placeholder="Ví dụ: 5 năm kinh nghiệm, chuyên về cầu lông…"
            value={bio}
            onChangeText={setBio}
          />
          {errors.bio && <Text className="text-red-500">{errors.bio}</Text>}
        </View>

        {/* Số điện thoại */}
        <View className="mb-4">
          <Text className="font-InterSemiBold mb-1">Số điện thoại</Text>
          <AppTextInput
            keyboardType="phone-pad"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
          />
          {errors.phone && <Text className="text-red-500">{errors.phone}</Text>}
        </View>

        {/* Môn huấn luyện */}
        <View className="mb-4">
          <Text className="font-InterSemiBold mb-1">Môn huấn luyện</Text>
          <SportsSelector
            label="Chọn môn"
            selectedSports={selectedSports}
            onSportsChange={setSelectedSports}
          />
          {errors.sports && <Text className="text-red-500">{errors.sports}</Text>}
        </View>

        {/* Giá theo môn */}
        {selectedSports.map((sid) => (
          <View key={sid} className="mb-4">
            <Text className="font-InterSemiBold mb-1">
              Giá VND/giờ môn #{sid}
            </Text>
            <AppTextInput
              keyboardType="numeric"
              placeholder="0"
              value={rates[sid] ?? ""}
              onChangeText={(txt) =>
                setRates((p) => ({ ...p, [sid]: txt }))
              }
            />
            {errors[`rate_${sid}`] && (
              <Text className="text-red-500">{errors[`rate_${sid}`]}</Text>
            )}
          </View>
        ))}

        {/* Kinh nghiệm */}
        <View className="mb-4">
          <Text className="font-InterSemiBold mb-1">
            Số năm kinh nghiệm
          </Text>
          <AppTextInput
            keyboardType="numeric"
            placeholder="Ví dụ: 3"
            value={yearsOfExp}
            onChangeText={setYearsOfExp}
          />
          {errors.yearsOfExp && (
            <Text className="text-red-500">{errors.yearsOfExp}</Text>
          )}
        </View>

        {/* Chứng chỉ */}
        <View className="mb-4">
          <Text className="font-InterSemiBold mb-1">
            Chứng chỉ (dấu phẩy)
          </Text>
          <AppTextInput
            placeholder="Ví dụ: Bằng A, HLV cấp I"
            value={certifications}
            onChangeText={setCertifications}
          />
        </View>

        {/* Thời gian session */}
        <View className="flex-row space-x-2 mb-4">
          <View className="flex-1">
            <Text className="font-InterSemiBold mb-1">Min (giờ)</Text>
            <AppTextInput
              keyboardType="numeric"
              placeholder="0.5"
              value={minDur}
              onChangeText={setMinDur}
            />
            {errors.minDur && <Text className="text-red-500">{errors.minDur}</Text>}
          </View>
          <View className="flex-1">
            <Text className="font-InterSemiBold mb-1">Max (giờ)</Text>
            <AppTextInput
              keyboardType="numeric"
              placeholder="2"
              value={maxDur}
              onChangeText={setMaxDur}
            />
            {errors.maxDur && <Text className="text-red-500">{errors.maxDur}</Text>}
          </View>
        </View>

        {/* Availability */}
        <View className="mb-6">
         <Toggle
  label="Sẵn sàng nhận lịch"
  // đưa boolean → string cho Toggle
  value={isAvailable ? "yes" : "no"}
  // đưa string ngược → boolean
  onChange={(val: string) => setIsAvailable(val === "yes")}
  options={[
    { label: "Có", value: "yes" },
    { label: "Không", value: "no" },
  ]}
/>
        </View>

        <AppButton title="Hoàn tất" filled onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
