import coachService from "@/services/coach";
import { CoachReviewStats } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Extended interface for the full coach profile data
interface CoachProfileData {
  id: string;
  bio?: string;
  hourlyRate?: number;
  isAvailable: boolean;
  yearsOfExperience?: number;
  user: {
    id: string;
    fullName: string;
    rating?: number;
    avatar?: {
      url: string;
    };
    favoriteSports?: { sport: { id: number; name: string } }[];
  };
}

interface SportRate {
  sport: string;
  rate: number;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CoachDetailViewProps {
  coachId: string;
  onBookSession?: () => void;
  showBookButton?: boolean;
}

export default function CoachDetailView({
  coachId,
  onBookSession,
  showBookButton = true,
}: CoachDetailViewProps) {
  const [coachProfile, setCoachProfile] = useState<CoachProfileData | null>(
    null
  );
  const [reviewStats, setReviewStats] = useState<CoachReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock total sessions data - this would come from your backend
  const mockTotalSessions = 21;

  useEffect(() => {
    if (coachId) {
      loadCoachProfile();
    }
  }, [coachId]);

  const loadCoachProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading coach profile for coachId:", coachId);

      if (!coachId) {
        setError("ID huấn luyện viên không hợp lệ");
        return;
      }

      // Use real service to fetch coach profile data
      const result = await coachService.getCoachProfile(parseInt(coachId));
      console.log("Coach profile result:", result);
      setCoachProfile(result.coachProfile);
      setReviewStats(result.coachReviewStats);
    } catch (err) {
      console.error("Error loading coach profile:", err);
      setError("Không thể tải thông tin huấn luyện viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallCoach = () => {
    Alert.alert("Gọi điện", "Chức năng gọi điện đang được phát triển");
  };

  const handleMessageCoach = () => {
    Alert.alert("Nhắn tin", "Chức năng nhắn tin đang được phát triển");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#F59E0B" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#F59E0B" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#D1D5DB"
        />
      );
    }

    return stars;
  };

  // Generate sport rates from specializations and hourly rate
  const generateSportRates = (): SportRate[] => {
    if (!coachProfile?.user?.favoriteSports || !coachProfile?.hourlyRate) {
      return [];
    }

    const getSportIcon = (
      sportName: string
    ): keyof typeof Ionicons.glyphMap => {
      const name = sportName.toLowerCase();
      if (name.includes("quần vợt") || name.includes("tennis"))
        return "tennisball-outline";
      if (name.includes("cầu lông") || name.includes("badminton"))
        return "fitness-outline";
      if (name.includes("pickleball")) return "american-football-outline";
      if (name.includes("bóng bàn") || name.includes("ping pong"))
        return "library-outline";
      return "fitness-outline"; // default icon
    };

    return coachProfile.user.favoriteSports.map((sport) => ({
      sport: sport.sport.name,
      rate: coachProfile.hourlyRate!,
      icon: getSportIcon(sport.sport.name),
    }));
  };

  const sportRates = generateSportRates();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#5A983B" />
        <Text className="text-gray-600 mt-4">Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error || !coachProfile) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-red-500 text-center mt-4 text-lg">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
          onPress={loadCoachProfile}
          activeOpacity={0.7}
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Coach Header Card */}
        <View className="bg-white rounded-2xl mx-4 mt-4 p-6 shadow-sm border border-gray-100">
          {/* Coach Info */}
          <View className="flex-row items-center space-x-4 mb-4">
            <View className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
              {coachProfile?.user?.avatar?.url ? (
                <Image
                  source={{ uri: coachProfile.user.avatar.url }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons name="person" size={40} color="#6B7280" />
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {coachProfile?.user?.fullName || "Không có tên"}
              </Text>

              {/* Specializations */}
              <Text className="text-gray-600 mb-2">
                {coachProfile?.user?.favoriteSports
                  ?.map((sport) => sport.sport.name)
                  .join(", ") || "Chưa có thông tin"}
              </Text>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleMessageCoach}
                  className="bg-gray-100 w-12 h-12 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble" size={20} color="#5A983B" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCallCoach}
                  className="bg-primary w-12 h-12 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around py-4 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {mockTotalSessions}
              </Text>
              <Text className="text-sm text-gray-600">Trận đã chơi</Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {coachProfile.yearsOfExperience || 0}
              </Text>
              <Text className="text-sm text-gray-600">Tham gia</Text>
              <Text className="text-sm text-gray-600">huấn luyện</Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {coachProfile?.user?.rating?.toFixed(1) || "0.0"}
              </Text>
              <Text className="text-sm text-gray-600">Điểm đánh giá</Text>
            </View>
          </View>
        </View>

        {/* Pricing Section */}
        {sportRates.length > 0 && (
          <View className="bg-white rounded-2xl mx-4 mt-4 p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Bảng giá
            </Text>

            {sportRates.map((sportRate, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between py-3"
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                    <Ionicons name={sportRate.icon} size={20} color="#5A983B" />
                  </View>
                  <Text className="text-base text-gray-900">
                    {sportRate.sport}
                  </Text>
                </View>

                <Text className="text-base font-semibold text-gray-900">
                  {`${sportRate.rate.toLocaleString("vi-VN")} vnd/1 tiếng`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Availability Status */}
        <View className="bg-white rounded-2xl mx-4 mt-4 p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Trạng thái
          </Text>

          <View className="flex-row items-center space-x-3">
            <View
              className={`w-3 h-3 rounded-full ${
                coachProfile.isAvailable ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <Text className="text-base text-gray-900">
              {coachProfile.isAvailable ? "Có sẵn" : "Không có sẵn"}
            </Text>
          </View>
        </View>

        {/* Reviews Section */}
        {reviewStats && (
          <View className="bg-white rounded-2xl mx-4 mt-4 p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Đánh giá</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-primary font-medium">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {/* Review Stats */}
            <View className="flex-row items-center space-x-2 mb-4">
              <Text className="text-base text-gray-900">
                {`${reviewStats.totalReviews} đánh giá`}
              </Text>
              <View className="flex-row space-x-1">
                {renderStars(reviewStats.averageRating)}
              </View>
              <Text className="text-sm text-gray-600 ml-2">
                ({reviewStats.averageRating.toFixed(1)})
              </Text>
            </View>

            {/* Placeholder for individual reviews */}
            <View className="space-y-4">
              <View className="flex-row space-x-3">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                  <Text className="text-white text-sm font-medium">U</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600">
                    Chưa có đánh giá chi tiết
                  </Text>
                  <View className="flex-row space-x-1 mt-1">
                    {renderStars(reviewStats.averageRating)}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Bio Section */}
        {coachProfile.bio && (
          <View className="bg-white rounded-2xl mx-4 mt-4 p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Giới thiệu
            </Text>
            <Text className="text-gray-700 leading-6">{coachProfile.bio}</Text>
          </View>
        )}

        {/* Bottom padding for scroll */}
        <View className="h-4" />
      </ScrollView>

      {/* Book Session Button */}
      {showBookButton && (
        <View className="bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            onPress={onBookSession}
            className="bg-primary py-4 rounded-xl items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">Đặt lịch</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
