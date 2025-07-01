import AppTextInput from "@/components/AppTextInput";
import coachService from "@/services/coach";
import { Coach } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CoachPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCoachSelect: (coach: Coach) => void;
  selectedCoach?: Coach | null;
}

const CoachPickerModal: React.FC<CoachPickerModalProps> = ({
  visible,
  onClose,
  onCoachSelect,
  selectedCoach,
}) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (visible) {
      fetchCoaches();
    } else {
      // Reset state when modal closes
      setSearchText("");
    }
  }, [visible]);

  useEffect(() => {
    filterCoaches();
  }, [searchText, coaches]);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      const coachData = await coachService.getAllCoaches();
      setCoaches(coachData);
      setFilteredCoaches(coachData);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCoaches = () => {
    if (!searchText.trim()) {
      setFilteredCoaches(coaches);
      return;
    }

    const filtered = coaches.filter(
      (coach) =>
        coach.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        coach.coachProfile?.bio
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        coach.favoriteSports?.some((favSport) =>
          favSport.sport.name.toLowerCase().includes(searchText.toLowerCase())
        )
    );
    setFilteredCoaches(filtered);
  };

  const formatHourlyRate = (rate?: number) => {
    if (!rate) return "";
    return `${rate.toLocaleString("vi-VN")}đ/giờ`;
  };

  const handleSelectCoach = (coach: Coach) => {
    onCoachSelect(coach);
    onClose();
  };

  const renderCoachItem = ({ item: coach }: { item: Coach }) => (
    <TouchableOpacity
      onPress={() => handleSelectCoach(coach)}
      className="p-4 border-b border-gray-100 bg-white"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center space-x-3">
        {/* Coach Avatar */}
        <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
          {coach.avatar?.url ? (
            <Image
              source={{ uri: coach.avatar.url }}
              className="w-full h-full"
            />
          ) : (
            <Ionicons name="person" size={32} color="#6B7280" />
          )}
        </View>

        {/* Coach Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-semibold text-gray-900 flex-1">
              {coach.fullName}
            </Text>
            {coach.rating && (
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-sm text-gray-600 ml-1 font-medium">
                  {coach.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {coach.coachProfile?.hourlyRate && (
            <Text className="text-sm text-primary font-semibold mb-1">
              {formatHourlyRate(coach.coachProfile.hourlyRate)}
            </Text>
          )}

          {coach.coachProfile?.bio && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {coach.coachProfile.bio}
            </Text>
          )}

          {/* Sports/Specializations */}
          {coach.favoriteSports && coach.favoriteSports.length > 0 && (
            <View className="flex-row flex-wrap">
              {coach.favoriteSports.slice(0, 3).map((favSport, index) => (
                <View
                  key={index}
                  className="bg-blue-50 px-2 py-1 rounded-full mr-1 mb-1"
                >
                  <Text className="text-xs text-blue-600 font-medium">
                    {favSport.sport.name}
                  </Text>
                </View>
              ))}
              {coach.favoriteSports.length > 3 && (
                <Text className="text-xs text-gray-500 mt-1">
                  {`+${coach.favoriteSports.length - 3} more`}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Selection Indicator */}
        <View className="w-10 h-10 rounded-full items-center justify-center">
          {selectedCoach?.id === coach.id ? (
            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          ) : (
            <View className="w-8 h-8 border-2 border-gray-300 rounded-full" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-xl w-full max-w-lg max-h-[80%] overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Chọn huấn luyện viên
            </Text>
            <View className="w-6" />
          </View>

          {/* Search Bar */}
          <View className="p-4 border-b border-gray-200">
            <AppTextInput
              placeholder="Tìm kiếm huấn luyện viên..."
              value={searchText}
              onChangeText={setSearchText}
              containerClassName="mb-0"
              left={<Ionicons name="search" size={20} color="#6B7280" />}
            />
          </View>

          {/* Coach List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator size="large" color="#5A983B" />
              <Text className="text-gray-600 mt-4">Đang tải...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCoaches}
              keyExtractor={(item) => item.id}
              renderItem={renderCoachItem}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center p-8">
                  <Ionicons name="person-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-4">
                    {searchText.trim()
                      ? "Không tìm thấy huấn luyện viên nào"
                      : "Chưa có huấn luyện viên nào"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CoachPickerModal;
