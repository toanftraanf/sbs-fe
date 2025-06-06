import SportNowHeader from "@/components/SportNowHeader";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from "expo-router";
import { useState } from "react";
import {
    Keyboard,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";

const LEVELS = [
  { label: "Cơ bản", value: "basic" },
  { label: "Trung bình", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

export default function UserInformationStep1() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<'player' | 'coach'>('player');
  const [level, setLevel] = useState<string>("");
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  const handleContinue = () => {
    if (!fullName || !dateOfBirth || !gender) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộcssssss");
      return;
    }
    router.push({
      pathname: "/(auth)/user-information-step2",
      params: {
        fullName,
        dateOfBirth: dateOfBirth.toISOString(),
        gender,
        address,
        role,
        level,
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <SportNowHeader title="Thông tin cá nhân" />
        <ScrollView className="flex-1 px-6 pt-4">
          <Text className="text-center text-gray-700 mb-4 mt-2">
            Vui lòng cập nhật thêm thông tin để SportNow có thể tìm người chơi phù hợp với bạn
          </Text>
          {/* Full Name */}
          <Text className="mb-1 font-InterSemiBold">Tên người dùng</Text>
          <AppTextInput
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            containerClassName="mb-4"
          />
          {/* Date of Birth */}
          <Text className="mb-1 font-InterSemiBold">Độ tuổi</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-4"
          >
            <Text className={`flex-1 ${dateOfBirth ? 'text-black' : 'text-gray-400'}`}>
              {dateOfBirth ? dateOfBirth.toLocaleDateString('vi-VN') : 'Chọn ngày sinh'}
            </Text>
            <Ionicons name="calendar" size={22} color="#515151" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateOfBirth(selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}
          {/* Gender */}
          <Text className="mb-1 font-InterSemiBold">Giới tính</Text>
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`flex-row items-center mr-6 ${gender === 'male' ? 'border-primary border-2' : 'border-gray-300 border'} rounded-full px-4 py-2`}
              onPress={() => setGender('male')}
            >
              <View className={`w-4 h-4 rounded-full border-2 mr-2 ${gender === 'male' ? 'border-primary bg-primary' : 'border-gray-400'}`} />
              <Text className="font-InterSemiBold">Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-row items-center ${gender === 'female' ? 'border-primary border-2' : 'border-gray-300 border'} rounded-full px-4 py-2`}
              onPress={() => setGender('female')}
            >
              <View className={`w-4 h-4 rounded-full border-2 mr-2 ${gender === 'female' ? 'border-primary bg-primary' : 'border-gray-400'}`} />
              <Text className="font-InterSemiBold">Nữ</Text>
            </TouchableOpacity>
          </View>
          {/* Address */}
          <Text className="mb-1 font-InterSemiBold">Vị trí</Text>
          <AppTextInput
            placeholder="Nhập địa chỉ của bạn"
            value={address}
            onChangeText={setAddress}
            containerClassName="mb-4"
          />
          {/* Role */}
          <Text className="mb-1 font-InterSemiBold">Tư cách</Text>
          <View className="flex-row mb-4 bg-gray-100 rounded-xl overflow-hidden">
            <TouchableOpacity
              className={`flex-1 py-3 items-center ${role === 'player' ? 'bg-primary' : ''}`}
              onPress={() => setRole('player')}
            >
              <Text className={`font-InterBold ${role === 'player' ? 'text-white' : 'text-primary'}`}>Người chơi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 items-center ${role === 'coach' ? 'bg-primary' : ''}`}
              onPress={() => setRole('coach')}
            >
              <Text className={`font-InterBold ${role === 'coach' ? 'text-white' : 'text-primary'}`}>Huấn luyện viên</Text>
            </TouchableOpacity>
          </View>
          {/* Level */}
          <Text className="mb-1 font-InterSemiBold">Trình độ</Text>
          <TouchableOpacity
            className="border border-gray-300 rounded-xl px-4 py-3 mb-8 flex-row items-center"
            onPress={() => setShowLevelDropdown(!showLevelDropdown)}
          >
            <Text className={`flex-1 ${level ? 'text-black' : 'text-gray-400'}`}>{LEVELS.find(l => l.value === level)?.label || 'Chọn trình độ của bạn'}</Text>
            <Ionicons name="chevron-down" size={20} color="#515151" />
          </TouchableOpacity>
          {showLevelDropdown && (
            <View className="border border-gray-300 rounded-xl mb-4 bg-white">
              {LEVELS.map(l => (
                <TouchableOpacity key={l.value} className="px-4 py-3" onPress={() => { setLevel(l.value); setShowLevelDropdown(false); }}>
                  <Text className="text-black">{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* <AppButton title="Tiếp tục" filled onPress={handleContinue} /> */}
          <AppButton title="Tiếp tục" filled onPress={() => {router.push("/(auth)/user-information-step2")}} />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
} 