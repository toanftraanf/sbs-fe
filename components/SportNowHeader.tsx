import { images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface SportNowHeaderProps {
  title: string;
  showBack?: boolean;
}

export default function SportNowHeader({ title, showBack = true }: SportNowHeaderProps) {
  return (
    <View className="bg-primary w-full items-center rounded-b-3xl pt-12 pb-8" style={{ minHeight: 160 }}>
      {showBack && (
        <TouchableOpacity className="absolute left-4 top-10" onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={35} color="#fff" />
        </TouchableOpacity>
      )}
      <Text className="text-white font-InterBold text-xl mt-12 mb-5">{title}</Text>
      <Image source={images.sportnowLogo} style={{ width: 200, height: 60 }} resizeMode="contain" />
    </View>
  );
}
