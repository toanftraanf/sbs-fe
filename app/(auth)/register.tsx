import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/AppButton";
import { images } from "../../constants";

const { width, height } = Dimensions.get("window");

export default function Register() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center">
      {/* Green header with logo */}
      <View
        className="w-full items-center justify-center"
        style={{
          backgroundColor: "#5A983B",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          height: height * 0.4,
        }}
      >
        <Image
          source={images.sportnowLogo}
          style={{
            width: width * 0.7,
            height: height * 0.13,
            resizeMode: "contain",
          }}
        />
      </View>

      {/* Question */}
      <Text className="text-secondary font-InterBold text-base text-center mt-8 mb-6">
        Bạn muốn đăng ký dưới tư cách là:
      </Text>

      {/* Buttons */}
      <View className="w-full px-6 space-y-4">
        <AppButton
          title="Người dùng"
          onPress={() => router.push("/(auth)/register-user")}
          filled
        />
        <AppButton
          title="Chủ sân tập"
          onPress={() => router.push("/(auth)/register-owner")}
          filled={false}
        />
      </View>

      {/* Back button */}
      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: 32 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-full border-2 border-secondary items-center justify-center"
        >
          <Ionicons className="text-secondary" name="arrow-back" size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
