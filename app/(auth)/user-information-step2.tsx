import AppButton from "@/components/AppButton";
import SportNowHeader from "@/components/SportNowHeader";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

export default function UserInformationStep2() {
  const { user, setUser } = useAuth();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [parsedSports, setParsedSports] = useState<number[]>([]);

  // Parse the sports data from step 1
  useEffect(() => {
    if (params.sports) {
      try {
        const sports = JSON.parse(params.sports as string);
        setParsedSports(sports);
      } catch (error) {
        console.error("Error parsing sports data:", error);
        setParsedSports([]);
      }
    }
  }, [params.sports]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderLabel = (gender: string) => {
    const labels: { [key: string]: string } = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return labels[gender] || gender;
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      player: "Người chơi",
      coach: "Huấn luyện viên",
    };
    return labels[role] || role;
  };

  const getSportsLabels = (sportIds: number[]) => {
    const sportsMap: { [key: number]: string } = {
      1: "Cầu lông",
      2: "Quần vợt",
      3: "Bóng bàn",
      4: "Pickleball",
    };
    return sportIds.map((id) => sportsMap[id] || `Sport ${id}`).join(", ");
  };

  const handleComplete = async () => {
    if (!user?.id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Convert data to backend format
      const sexMapping: { [key: string]: "MALE" | "FEMALE" | "OTHER" } = {
        male: "MALE",
        female: "FEMALE",
        other: "OTHER",
      };

      const userTypeMapping: { [key: string]: "PLAYER" | "COACH" } = {
        player: "PLAYER",
        coach: "COACH",
      };

      const levelMapping: { [key: string]: string } = {
        beginner: "BEGINNER",
        intermediate: "INTERMEDIATE",
        advanced: "ADVANCED",
        pro: "PRO",
      };

      // Save user information to backend
      const updatedUser = await authService.updateUserProfileWithSports({
        userId: parseInt(user.id),
        fullName: (params.fullName as string)?.trim(),
        dob: new Date(params.dateOfBirth as string).toISOString().split("T")[0],
        sex: sexMapping[params.gender as string] || "OTHER",
        address: (params.address as string)?.trim(),
        userType: userTypeMapping[params.role as string] || "PLAYER",
        level: levelMapping[params.level as string] || "BEGINNER",
        sportIds: parsedSports,
      });

      // Update user context with new data
      setUser({
        ...user,
        fullName: updatedUser.fullName,
        dob: updatedUser.dob,
        sex: updatedUser.sex,
        address: updatedUser.address,
        userType: updatedUser.userType,
        level: updatedUser.level,
      });

      Alert.alert(
        "Thành công",
        "Thông tin cá nhân đã được cập nhật thành công!",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on user role
              if (user.role === "OWNER") {
                // Owner users go to stadium information setup
                router.push("/(auth)/stadium-information-step1");
              } else {
                // Customer users go to main app tabs
                router.push("/(tabs)");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving user information:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SportNowHeader title="Xác nhận thông tin" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-center text-gray-700 mb-6 mt-2">
          Vui lòng kiểm tra lại thông tin của bạn trước khi hoàn tất
        </Text>

        {/* Summary Information */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="font-InterBold text-lg mb-4 text-center">
            Thông tin cá nhân
          </Text>

          <View className="space-y-3">
            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Tên:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {params.fullName || "Chưa nhập"}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Ngày sinh:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {formatDate(params.dateOfBirth as string) || "Chưa chọn"}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Giới tính:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {getGenderLabel(params.gender as string) || "Chưa chọn"}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Địa chỉ:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {params.address || "Chưa nhập"}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Tư cách:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {getRoleLabel(params.role as string) || "Chưa chọn"}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Trình độ:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {params.level || "Chưa chọn"}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="font-InterSemiBold text-gray-600 w-24">
                Môn thể thao:
              </Text>
              <Text className="font-InterRegular text-black flex-1">
                {getSportsLabels(parsedSports) || "Chưa chọn"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <AppButton
            title={isLoading ? "Đang lưu..." : "Hoàn tất"}
            filled
            onPress={handleComplete}
            disabled={isLoading}
          />

          <AppButton
            title="Quay lại chỉnh sửa"
            filled={false}
            onPress={() => router.back()}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
