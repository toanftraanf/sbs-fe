import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { images } from "../constants";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Image
        source={images.onboardingBg}
        className="absolute w-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={["#5A983B", "#1E3213", "rgba(30, 50, 19, 0)"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        className="absolute left-0 right-0 bottom-0"
        style={{ height: height * 1 }}
      />
      <View
        className="absolute left-0 right-0"
        style={{
          bottom: height * 0.18,
          paddingHorizontal: width * 0.06,
          alignItems: "flex-start",
        }}
      >
        <Text
          className="font-InterBold text-white font-semibold mb-2"
          style={{ fontSize: width * 0.05 }}
        >
          Chào mừng đến với
        </Text>
        <Image
          source={images.sportnowLogo}
          className="mb-2"
          style={{
            width: width * 0.5,
            height: height * 0.12,
            resizeMode: "contain",
          }}
        />
        <Text
          className="font-InterBold text-white text-left mb-3"
          style={{ fontSize: width * 0.04 }}
        >
          Ứng dụng tìm kiếm và ghép cặp{"\n"}bạn cùng chơi thể thao.
        </Text>
      </View>
      <View
        className="absolute w-full items-center"
        style={{ bottom: height * 0.06, left: 0, right: 0 }}
      >
        <TouchableOpacity
          className="bg-white rounded-2xl shadow pt-2 pb-2"
          onPress={() => router.push("/menu")}
        >
          <View className="flex-row items-center justify-center px-6 py-2">
            <Text
              className="font-InterBold text-secondary"
              style={{ fontSize: width * 0.045 }}
            >
              Tiếp theo{" "}
            </Text>
            <Ionicons
              className="text-secondary"
              name="chevron-forward"
              size={18}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
