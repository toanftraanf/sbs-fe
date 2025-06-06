import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AppButton from "../../components/AppButton";
import SportNowHeader from "../../components/SportNowHeader";

const TABS = [
  { key: "avatar", label: "Ảnh đại diện", icon: "person-circle" },
  { key: "banner", label: "Ảnh banner", icon: "image" },
  { key: "stadium", label: "Ảnh sân tập", icon: "images" },
];

// Dummy images (replace with your upload logic)
const DUMMY_IMAGES = [
  { uri: "https://picsum.photos/200/200?random=1" },
  { uri: "https://picsum.photos/200/200?random=2" },
  { uri: "https://picsum.photos/200/200?random=3" },
  { uri: "https://picsum.photos/200/200?random=4" },
  { uri: "https://picsum.photos/200/200?random=5" },
];

export default function StadiumInformationStep3() {
  const [activeTab, setActiveTab] = useState("avatar");

  // Filter images by tab if needed
  const images = DUMMY_IMAGES; // Replace with your logic

  return (
    <View className="flex-1 bg-white">
      <SportNowHeader title="Thông tin sân tập" />
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Vui lòng cập nhật thêm thông tin về sân tập của bạn.
        </Text>
        {/* Tabs */}
        <View className="flex-row mb-4">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 items-center pb-2 border-b-2 ${
                activeTab === tab.key ? "border-primary" : "border-gray-200"
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={activeTab === tab.key ? "#4CAF50" : "#B0B0B0"}
              />
              <Text
                className={`mt-1 font-InterBold ${
                  activeTab === tab.key ? "text-primary" : "text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Image grid */}
        <View className="flex-row flex-wrap">
          {images.map((img, idx) => (
            <View
              key={idx}
              className="w-[30%] aspect-square m-[1.5%] rounded-xl overflow-hidden bg-gray-100"
            >
              <Image
                source={img}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            </View>
          ))}
        </View>
        {/* Progress Indicator */}
        {/* <View className="flex-row justify-center items-center my-4">
          <View className="w-3 h-3 rounded-full bg-gray-300 mx-1" />
          <View className="w-3 h-3 rounded-full bg-gray-300 mx-1" />
          <View className="w-3 h-3 rounded-full bg-primary mx-1" />
        </View> */}
        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton style={{ width: "48%" }} title="Quay lại" filled={false} onPress={() => router.back()} />
          <AppButton style={{ width: "48%" }} title="Hoàn thành" filled onPress={() => {router.push("/(tabs)")}} />
        </View>
      </ScrollView>
    </View>
  );
}