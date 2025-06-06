import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, Image, View } from "react-native";
import AppButton from "../components/AppButton";
import { images } from "../constants";

const { width, height } = Dimensions.get("window");

export default function Menu() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#5A983B", "rgba(80, 136, 53, 0.839)", "rgba(30, 50, 19, 0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute left-0 right-0 top-0"
        style={{ width, height: height * 0.6 }}
        locations={[0, 0.681, 1]}
      />
      {/* Logo */}
      <View
        className="absolute w-full items-center"
        style={{ top: height * 0.28 }}
      >
        <Image
          source={images.sportnowLogo}
          style={{
            width: width * 0.8,
            height: height * 0.13,
            resizeMode: "contain",
          }}
        />
      </View>
      {/* Buttons */}
      <View
        className="absolute w-full px-6 space-y-4"
        style={{ bottom: height * 0.2 }}
      >
        <AppButton
          title="Đăng nhập"
          onPress={() => router.push("/(auth)/login")}
          filled
        />
        <AppButton
          title="Đăng ký"
          onPress={() => router.push("/(auth)/register")}
          filled={false}
        />
      </View>
    </View>
  );
}
