import sportsService from "@/services/sports";
import * as stadiumApi from "@/services/stadium";
import { Sport } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import ContactInputList from "../../components/ContactInputList";
import SportNowHeader from "../../components/SportNowHeader";
import SportsSelector from "../../components/SportsSelector";

export default function StadiumInformationStep1() {
  // State for all fields
  const [stadiumName, setStadiumName] = useState("");
  const [googleMap, setGoogleMap] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [otherContacts, setOtherContacts] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("05:00");
  const [endTime, setEndTime] = useState("21:00");
  const [otherInfo, setOtherInfo] = useState("");
  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [startTimeDate, setStartTimeDate] = useState<Date | null>(null);
  const [endTimeDate, setEndTimeDate] = useState<Date | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { stadiumId } = useLocalSearchParams();

  // Helper function to round time to nearest 30 minutes
  const roundToNearest30Minutes = (date: Date): Date => {
    const newDate = new Date(date);
    const minutes = newDate.getMinutes();
    const roundedMinutes = Math.round(minutes / 30) * 30;
    newDate.setMinutes(roundedMinutes, 0, 0);

    // If rounded to 60, move to next hour
    if (newDate.getMinutes() === 60) {
      newDate.setHours(newDate.getHours() + 1, 0, 0, 0);
    }

    return newDate;
  };

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (stadiumId && !sportsLoading && availableSports.length > 0) {
      fetchStadiumData();
    }
  }, [stadiumId, sportsLoading, availableSports]);

  const fetchSports = async () => {
    try {
      setSportsLoading(true);
      const sports = await sportsService.getAllSports();
      setAvailableSports(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
    } finally {
      setSportsLoading(false);
    }
  };

  const fetchStadiumData = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumStep1(
        parseInt(stadiumId as string)
      );
      setStadiumName(data.name);
      setGoogleMap(data.googleMap);
      setPhone(data.phone);
      setEmail(data.email);
      setWebsite(data.website);
      setOtherContacts(
        data.otherContacts.length > 0 ? data.otherContacts : [""]
      );
      setDescription(data.description);
      setStartTime(data.startTime);
      setEndTime(data.endTime);
      setOtherInfo(data.otherInfo);

      // Convert time strings to Date objects for time pickers
      if (data.startTime) {
        const [hours, minutes] = data.startTime.split(":");
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        setStartTimeDate(startDate);
      }
      if (data.endTime) {
        const [hours, minutes] = data.endTime.split(":");
        const endDate = new Date();
        endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        setEndTimeDate(endDate);
      }
      // Convert sport names to IDs
      const sportIds = data.sports
        .map((sportName: string) => {
          const sport = availableSports.find((s) => s.name === sportName);
          return sport ? sport.id : null;
        })
        .filter((id: number | null): id is number => id !== null);
      setSelectedSports(sportIds);
    } catch (err) {
      console.error("Error fetching stadium data:", err);
      alert("Không thể tải dữ liệu sân tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    // Stadium name validation
    if (!stadiumName || stadiumName.trim() === "") {
      newErrors.stadiumName = "Vui lòng nhập tên cụm sân";
    } else if (stadiumName.trim().length < 3) {
      newErrors.stadiumName = "Tên sân phải có ít nhất 3 ký tự";
    }

    // Google Map validation
    if (!googleMap || googleMap.trim() === "") {
      newErrors.googleMap = "Vui lòng nhập link Google Map";
    }

    // Phone validation
    if (!phone || phone.trim() === "") {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Email validation
    if (!email || email.trim() === "") {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Time validation
    if (!startTimeDate) {
      newErrors.startTime = "Vui lòng chọn giờ mở cửa";
    }
    if (!endTimeDate) {
      newErrors.endTime = "Vui lòng chọn giờ đóng cửa";
    }
    if (startTimeDate && endTimeDate && startTimeDate >= endTimeDate) {
      newErrors.endTime = "Giờ đóng cửa phải sau giờ mở cửa";
    }

    // Sports validation
    if (selectedSports.length === 0) {
      newErrors.sports = "Vui lòng chọn ít nhất một môn thể thao";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!validateFields()) {
        const firstError = Object.values(errors)[0];
        alert(firstError);
        return;
      }

      // Convert sport IDs to names for step data
      const sportNames = selectedSports
        .map((sportId) => {
          const sport = availableSports.find((s) => s.id === sportId);
          return sport ? sport.name : "";
        })
        .filter((name) => name !== "");

      // Convert time dates to strings
      const startTimeString = startTimeDate
        ? `${startTimeDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${startTimeDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        : startTime;
      const endTimeString = endTimeDate
        ? `${endTimeDate.getHours().toString().padStart(2, "0")}:${endTimeDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        : endTime;

      const step1Data = {
        name: stadiumName,
        googleMap,
        phone,
        email,
        website,
        otherContacts,
        description,
        startTime: startTimeString,
        endTime: endTimeString,
        otherInfo,
        sports: sportNames,
      };

      console.log("Step 1 data:", step1Data);

      // Navigate to step 2 with step 1 data
      router.push({
        pathname: "/(auth)/stadium-information-step2",
        params: {
          step1Data: JSON.stringify(step1Data),
          ...(stadiumId && { stadiumId }), // Include stadiumId if editing existing stadium
        },
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSport = (sportId: number) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SportNowHeader title="Thông tin sân tập" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Vui lòng cập nhật thêm thông tin về sân tập của bạn.
        </Text>
        {/* Stadium Name */}
        <View className="mb-3">
          <TextInput
            placeholder="Tên cụm sân"
            value={stadiumName}
            onChangeText={(text) => {
              setStadiumName(text);
              if (errors.stadiumName) {
                const newErrors = { ...errors };
                delete newErrors.stadiumName;
                setErrors(newErrors);
              }
            }}
            className="border border-gray-300 rounded-xl px-4 py-3"
          />
          {errors.stadiumName && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.stadiumName}
            </Text>
          )}
        </View>
        {/* Google Map Link */}
        <TextInput
          placeholder="Link Google Map"
          value={googleMap}
          onChangeText={setGoogleMap}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Phone */}
        <TextInput
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Website/Facebook */}
        <TextInput
          placeholder="Website hoặc link Facebook"
          value={website}
          onChangeText={setWebsite}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Other Contacts */}
        <ContactInputList
          contacts={otherContacts}
          onContactsChange={setOtherContacts}
          placeholder="Điện thoại khác"
        />
        {/* Description */}
        <TextInput
          placeholder="Thông tin mô tả"
          value={description}
          onChangeText={setDescription}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
          multiline
          numberOfLines={3}
        />
        {/* Time */}
        <View className="flex-row items-center mb-3">
          <View className="flex-1 mr-2">
            <Text className="mb-1 font-InterSemiBold">Giờ mở cửa</Text>
            <TouchableOpacity
              onPress={() => {
                // Close any open pickers first
                setShowEndTimePicker(false);
                // Use setTimeout to ensure state is updated
                setTimeout(() => setShowStartTimePicker(true), 0);
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
              activeOpacity={0.7}
            >
              <Text className={startTimeDate ? "text-black" : "text-gray-400"}>
                {startTimeDate
                  ? `${startTimeDate
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${startTimeDate
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : "Chọn giờ mở cửa"}
              </Text>
              <Text className="text-gray-400">🕒</Text>
            </TouchableOpacity>
            {errors.startTime && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.startTime}
              </Text>
            )}
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-1 font-InterSemiBold">Giờ đóng cửa</Text>
            <TouchableOpacity
              onPress={() => {
                // Close any open pickers first
                setShowStartTimePicker(false);
                // Use setTimeout to ensure state is updated
                setTimeout(() => setShowEndTimePicker(true), 0);
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
              activeOpacity={0.7}
            >
              <Text className={endTimeDate ? "text-black" : "text-gray-400"}>
                {endTimeDate
                  ? `${endTimeDate
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${endTimeDate
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : "Chọn giờ đóng cửa"}
              </Text>
              <Text className="text-gray-400">🕒</Text>
            </TouchableOpacity>
            {errors.endTime && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.endTime}
              </Text>
            )}
          </View>
        </View>

        {/* Start Time Picker */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTimeDate || new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minuteInterval={Platform.OS === "ios" ? 30 : undefined}
            onChange={(event, selectedDate) => {
              if (Platform.OS === "android") {
                setShowStartTimePicker(false);
              }
              if (event.type === "set" && selectedDate) {
                if (Platform.OS === "ios") {
                  setShowStartTimePicker(false);
                }

                // Round to nearest 30 minutes for Android, iOS handles it natively
                const roundedDate =
                  Platform.OS === "android"
                    ? roundToNearest30Minutes(selectedDate)
                    : selectedDate;

                setStartTimeDate(roundedDate);
                const timeString = `${roundedDate
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${roundedDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;
                setStartTime(timeString);
                if (errors.startTime) {
                  const newErrors = { ...errors };
                  delete newErrors.startTime;
                  setErrors(newErrors);
                }
              } else if (event.type === "dismissed") {
                setShowStartTimePicker(false);
              }
            }}
          />
        )}

        {/* End Time Picker */}
        {showEndTimePicker && (
          <DateTimePicker
            value={endTimeDate || new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minuteInterval={Platform.OS === "ios" ? 30 : undefined}
            onChange={(event, selectedDate) => {
              if (Platform.OS === "android") {
                setShowEndTimePicker(false);
              }
              if (event.type === "set" && selectedDate) {
                if (Platform.OS === "ios") {
                  setShowEndTimePicker(false);
                }

                // Round to nearest 30 minutes for Android, iOS handles it natively
                const roundedDate =
                  Platform.OS === "android"
                    ? roundToNearest30Minutes(selectedDate)
                    : selectedDate;

                setEndTimeDate(roundedDate);
                const timeString = `${roundedDate
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${roundedDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;
                setEndTime(timeString);
                if (errors.endTime) {
                  const newErrors = { ...errors };
                  delete newErrors.endTime;
                  setErrors(newErrors);
                }
              } else if (event.type === "dismissed") {
                setShowEndTimePicker(false);
              }
            }}
          />
        )}
        {/* Other Info */}
        <TextInput
          placeholder="Khác"
          value={otherInfo}
          onChangeText={setOtherInfo}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Sports */}
        <View className="mb-6">
          <SportsSelector
            label="Các môn thể thao"
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
        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton
            style={{ width: "48%" }}
            title="Quay lại"
            filled={false}
            onPress={() => router.back()}
          />
          <AppButton
            style={{ width: "48%" }}
            title={isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
            filled
            onPress={handleNext}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
