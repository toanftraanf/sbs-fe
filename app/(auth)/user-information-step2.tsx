import SportNowHeader from "@/components/SportNowHeader";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SPORTS = [
  { key: "badminton", label: "Cầu lông", icon: require("../../assets/icons/google_icon.png") },
  { key: "tennis", label: "Quần vợt", icon: require("../../assets/icons/google_icon.png") },
  { key: "tabletennis", label: "Bóng bàn", icon: require("../../assets/icons/google_icon.png") },
  { key: "pickleball", label: "Pickleball", icon: require("../../assets/icons/google_icon.png") },
];

export default function UserInformationStep2() {
  const params = useLocalSearchParams();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleSport = (key: string) => {
    setSelectedSports((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleContinue = () => {
    if (selectedSports.length === 0) {
      alert("Vui lòng chọn ít nhất một môn thể thao");
      return;
    }
    // Here you can submit all data (params + selectedSports) or navigate further
    // Example: router.push('/(auth)/verify-otp');
    alert("Thông tin đã được lưu!\n" + JSON.stringify({ ...params, selectedSports }, null, 2));
  };

  return (
    <View className="flex-1 bg-white">
      <SportNowHeader title="Thông tin cá nhân" />
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Chọn các môn thể thao mà bạn yêu thích
        </Text>
        <View className="flex-row flex-wrap justify-between mb-2">
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport.key}
              className={`w-[48%] aspect-square bg-white rounded-2xl mb-4 items-center justify-center border-2 ${selectedSports.includes(sport.key) ? 'border-primary' : 'border-gray-200'}`}
              onPress={() => toggleSport(sport.key)}
              activeOpacity={0.8}
            >
              <Image source={sport.icon} style={{ width: 56, height: 56, marginBottom: 12 }} resizeMode="contain" />
              <Text className={`font-InterBold text-lg ${selectedSports.includes(sport.key) ? 'text-primary' : 'text-gray-700'}`}>{sport.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* <TouchableOpacity
          className="bg-primary rounded-2xl py-4 mb-8"
          onPress={handleContinue}
        >
          <Text className="text-white text-center font-InterBold text-lg">Tiếp tục</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 mb-8"
          onPress={() => {router.push("/(auth)/stadium-information-step1")}}
        >
          <Text className="text-white text-center font-InterBold text-lg">Tiếp tục</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
} 