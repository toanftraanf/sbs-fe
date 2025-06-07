import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as stadiumApi from "@/services/stadium";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import SportNowHeader from "../../components/SportNowHeader";
import AppButton from "../../components/AppButton";

export default function StadiumList() {
  const [stadiums, setStadiums] = useState<stadiumApi.Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // TODO: Get userId from auth context or storage
  const userId = 1; // Temporary hardcoded value

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumsByUser(userId);
      setStadiums(data);
    } catch (err) {
      console.error('Error fetching stadiums:', err);
      alert('Không thể tải danh sách sân tập. Vui lòng thử lại.');
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SportNowHeader title="Danh sách sân tập" />
      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stadiums.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-center mb-4">
              Bạn chưa có sân tập nào. Hãy thêm sân tập mới!
            </Text>
          </View>
        ) : (
          stadiums.map((stadium) => (
            <TouchableOpacity
              key={stadium.id}
              className="bg-white rounded-xl shadow-sm mb-4 p-4 border border-gray-200"
              onPress={() => handleEditStadium(stadium.id)}
            >
              <View className="flex-row items-center">
                {stadium.avatarUrl ? (
                  <Image
                    source={{ uri: stadium.avatarUrl }}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-gray-200 mr-4 items-center justify-center">
                    <Ionicons name="business" size={24} color="#666" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="font-InterBold text-lg mb-1">{stadium.name}</Text>
                  <Text className="text-gray-600 mb-1">{stadium.phone}</Text>
                  <Text className="text-gray-500 text-sm" numberOfLines={2}>
                    {stadium.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View className="p-6 border-t border-gray-200">
        <AppButton
          title="Thêm sân tập mới"
          filled
          onPress={handleAddStadium}
        />
      </View>
    </View>
  );
} 