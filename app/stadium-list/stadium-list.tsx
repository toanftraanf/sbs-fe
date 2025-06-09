import { useAuth } from "@/contexts/AuthContext";
import * as stadiumApi from "@/services/stadium";
import { Stadium } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import SportNowHeader from "../../components/SportNowHeader";

export default function StadiumList() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const userId = user?.id ? parseInt(user.id) : 0;

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumsByUser(userId);
      setStadiums(data);
    } catch (err) {
      console.error("Error fetching stadiums:", err);
      alert("Không thể tải danh sách sân tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStadiums();
    setRefreshing(false);
  };

  const handleAddStadium = () => {
    router.push("/(auth)/stadium-information-step1");
  };

  const handleEditStadium = (stadiumId: number) => {
    router.push({
      pathname: "/(auth)/stadium-information-step1",
      params: { stadiumId },
    });
  };

  const renderStadiumItem = ({ item }: { item: Stadium }) => (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm mb-4 p-4 border border-gray-200"
      onPress={() => handleEditStadium(item.id)}
    >
      <View className="flex-row items-center">
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            className="w-16 h-16 rounded-full mr-4"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-200 mr-4 items-center justify-center">
            <Ionicons name="business" size={24} color="#666" />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-InterBold text-lg mb-1">{item.name}</Text>
          <Text className="text-gray-600 mb-1">{item.phone}</Text>
          <Text className="text-gray-500 text-sm" numberOfLines={2}>
            {item.description}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
              <Text className="text-green-600 text-sm font-InterSemiBold">
                Hoạt động
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">
              {item.startTime} - {item.endTime}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SportNowHeader title="Danh sách sân tập" />
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-InterBold text-gray-800">
            Sân của tôi
          </Text>
          <TouchableOpacity
            onPress={handleAddStadium}
            className="bg-[#7CB518] w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {stadiums.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="business-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">Chưa có sân nào</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Thêm sân đầu tiên để bắt đầu quản lý dịch vụ của bạn
            </Text>
            <AppButton
              title="Thêm sân mới"
              filled
              onPress={handleAddStadium}
              style={{ marginTop: 24 }}
            />
          </View>
        ) : (
          <FlatList
            data={stadiums}
            renderItem={renderStadiumItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </View>
  );
}
