// src/screens/Setting.tsx

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import { useMutation, useQuery, gql } from "@apollo/client";

import SportNowHeader from "@/components/SportNowHeader";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";

// Query để lấy user (như cũ)
const GET_USER = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      fullName
      dob
      sex
      address
      userType
      level
      email
      phoneNumber
    }
  }
`;

// Mutation cập nhật user (như cũ)
const UPDATE_USER = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      fullName
      dob
      sex
      address
      userType
      level
      email
      phoneNumber
    }
  }
`;

// Mảng LEVELS: value phải khớp ENUM “UserLevel” trên server (uppercase)
const LEVELS = [
  { label: "Cơ bản", value: "BEGINNER" },
  { label: "Trung bình", value: "INTERMEDIATE" },
  { label: "Nâng cao", value: "ADVANCED" },
  { label: "Chuyên nghiệp", value: "PRO" },
];

export default function Setting() {
  // ----- State form -----
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // NOTE: gender kiểu “MALE” | “FEMALE” | “OTHER” (uppercase)
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | null>(null);

  const [address, setAddress] = useState("");

  // NOTE: userType kiểu “PLAYER” | “COACH” (uppercase)
  const [userType, setUserType] = useState<"PLAYER" | "COACH">("PLAYER");

  // NOTE: level cũng uppercase (“BEGINNER” | “INTERMEDIATE” …)
  const [level, setLevel] = useState<string>("");

  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // TODO: Lấy ID user từ context/auth thật sự
  const userId = 1;

  // ----- useQuery GET_USER -----
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId },
    onCompleted: (data) => {
      if (data?.user) {
        setFullName(data.user.fullName || "");
        setDateOfBirth(data.user.dob ? new Date(data.user.dob) : null);
        setGender(data.user.sex || null);
        setAddress(data.user.address || "");
        setUserType(data.user.userType || "PLAYER");
        setLevel(data.user.level || "");
        setEmail(data.user.email || "");
        setPhoneNumber(data.user.phoneNumber || "");
      }
    },
  });

  // ----- useMutation UPDATE_USER -----
  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      Alert.alert("Thành công", "Thông tin đã được cập nhật");
    },
    onError: (error) => {
      console.error("Update error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    },
  });

  // Gửi mutation khi nhấn Lưu
  const handleSave = async () => {
    try {
      // Cần format ngày sinh thành “YYYY-MM-DD”
      const dobString = dateOfBirth
        ? dateOfBirth.toISOString().split("T")[0]
        : null;

      const updateData = {
        id: userId,
        fullName,
        dob: dobString,
        sex: gender,
        address,
        userType,
        level,
        email,
        phoneNumber,
      };

      console.log("Sending update data:", updateData);

      await updateUser({
        variables: {
          updateUserInput: updateData,
        },
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Có lỗi xảy ra. Vui lòng thử lại sau.</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <SportNowHeader title="Thông tin cá nhân" />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="border border-gray-300 rounded-xl p-4 bg-white">
            <Text className="text-center text-gray-700 mb-4 mt-2 px-1">
              Cập nhật thông tin cá nhân của bạn
            </Text>

            {/* Số điện thoại */}
            <Text className="mb-1 font-InterSemiBold ml-1">Số điện thoại</Text>
            <AppTextInput
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              containerClassName="mb-4"
              keyboardType="phone-pad"
            />

            {/* Email */}
            <Text className="mb-1 font-InterSemiBold ml-1">Email</Text>
            <AppTextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              containerClassName="mb-4"
              keyboardType="email-address"
            />

            {/* Tên người dùng */}
            <Text className="mb-1 font-InterSemiBold ml-1">Tên người dùng</Text>
            <AppTextInput
              placeholder="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              containerClassName="mb-4"
            />

            {/* Ngày sinh */}
            <Text className="mb-1 font-InterSemiBold ml-1">Ngày sinh</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-4"
            >
              <Text
                className={`flex-1 ${dateOfBirth ? "text-black" : "text-gray-400"}`}
              >
                {dateOfBirth
                  ? dateOfBirth.toLocaleDateString("vi-VN")
                  : "Chọn ngày sinh"}
              </Text>
              <Ionicons name="calendar" size={22} color="#515151" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dateOfBirth || new Date(2000, 0, 1)}
                mode="date"
                // Android sẽ tự bật dialog calendar, iOS spinner
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                textColor="black"
                accentColor="black"
                style={{ width: '100%' }}
              />
            )}

            {/* Giới tính */}
            <Text className="mb-1 font-InterSemiBold ml-1">Giới tính</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                className={`flex-row items-center mr-6 ${
                  gender === "MALE" ? "border-primary border-2" : "border-gray-300 border"
                } rounded-full px-4 py-2`}
                onPress={() => setGender("MALE")}
              >
                <View
                  className={`w-4 h-4 rounded-full border-2 mr-2 ${
                    gender === "MALE" ? "border-primary bg-primary" : "border-gray-400"
                  }`}
                />
                <Text className="font-InterSemiBold">Nam</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center ${
                  gender === "FEMALE" ? "border-primary border-2" : "border-gray-300 border"
                } rounded-full px-4 py-2`}
                onPress={() => setGender("FEMALE")}
              >
                <View
                  className={`w-4 h-4 rounded-full border-2 mr-2 ${
                    gender === "FEMALE" ? "border-primary bg-primary" : "border-gray-400"
                  }`}
                />
                <Text className="font-InterSemiBold">Nữ</Text>
              </TouchableOpacity>
            </View>

            {/* Địa chỉ */}
            <Text className="mb-1 font-InterSemiBold ml-1">Địa chỉ</Text>
            <AppTextInput
              placeholder="Nhập địa chỉ của bạn"
              value={address}
              onChangeText={setAddress}
              containerClassName="mb-4"
            />

            {/* Tư cách */}
            <Text className="mb-1 font-InterSemiBold ml-1">Tư cách</Text>
            <View className="flex-row mb-4 bg-gray-100 rounded-xl overflow-hidden">
              <TouchableOpacity
                className={`flex-1 py-3 items-center ${
                  userType === "PLAYER" ? "bg-primary" : ""
                }`}
                onPress={() => setUserType("PLAYER")}
              >
                <Text
                  className={`font-InterBold ${
                    userType === "PLAYER" ? "text-white" : "text-primary"
                  }`}
                >
                  Người chơi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 items-center ${
                  userType === "COACH" ? "bg-primary" : ""
                }`}
                onPress={() => setUserType("COACH")}
              >
                <Text
                  className={`font-InterBold ${
                    userType === "COACH" ? "text-white" : "text-primary"
                  }`}
                >
                  Huấn luyện viên
                </Text>
              </TouchableOpacity>
            </View>

            {/* Trình độ */}
            <Text className="mb-1 font-InterSemiBold ml-1">Trình độ</Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-xl px-4 py-3 mb-8 flex-row items-center"
              onPress={() => setShowLevelDropdown(!showLevelDropdown)}
            >
              <Text className={`flex-1 ${level ? "text-black" : "text-gray-400"}`}>
                {LEVELS.find((lvl) => lvl.value === level)?.label ||
                  "Chọn trình độ của bạn"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#515151" />
            </TouchableOpacity>
            {showLevelDropdown && (
              <View className="border border-gray-300 rounded-xl mb-4 bg-white">
                {LEVELS.map((lvl) => (
                  <TouchableOpacity
                    key={lvl.value}
                    className="px-4 py-3"
                    onPress={() => {
                      setLevel(lvl.value);
                      setShowLevelDropdown(false);
                    }}
                  >
                    <Text className="text-black">{lvl.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Nút Lưu */}
            <AppButton title="Lưu thông tin" filled onPress={handleSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
