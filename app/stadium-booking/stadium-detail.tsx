import { images } from "@/constants";
import { useApolloClient, useQuery } from "@apollo/client";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GET_REVIEW_STATS,
  GET_STADIUM_BY_ID,
  GET_STADIUM_REVIEWS,
} from "../../graphql";
import { Review, ReviewStats, Stadium } from "../../types";

export default function StadiumDetail() {
  const { stadiumId } = useLocalSearchParams();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [loading, setLoading] = useState(true);
  const apolloClient = useApolloClient();
  const router = useRouter();

  // Fetch reviews and review stats
  const { data: reviewsData, loading: reviewsLoading } = useQuery(
    GET_STADIUM_REVIEWS,
    {
      variables: { stadiumId: parseInt(stadiumId as string) },
      skip: !stadiumId,
    }
  );

  const { data: reviewStatsData, loading: reviewStatsLoading } = useQuery(
    GET_REVIEW_STATS,
    {
      variables: { stadiumId: parseInt(stadiumId as string) },
      skip: !stadiumId,
    }
  );

  useEffect(() => {
    fetchStadiumDetails();
  }, [stadiumId]);

  const fetchStadiumDetails = async () => {
    try {
      setLoading(true);
      const { data, errors } = await apolloClient.query({
        query: GET_STADIUM_BY_ID,
        variables: { id: parseInt(stadiumId as string) },
      });
      if (errors)
        throw new Error(
          errors[0]?.message || "Failed to fetch stadium details"
        );
      if (!data?.stadium) throw new Error("Stadium not found");
      setStadium(data.stadium);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin sân bóng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const reviews: Review[] = reviewsData?.stadiumReviews || [];
  const reviewStats: ReviewStats | null = reviewStatsData?.reviewStats || null;

  const renderUserAvatar = (user: Review["user"]) => {
    if (user?.avatar?.url) {
      return (
        <Image
          source={{ uri: user.avatar.url }}
          className="w-8 h-8 rounded-full mr-3"
          onError={() => console.log("Failed to load avatar")}
        />
      );
    }

    if (user?.fullName) {
      const initials = user.fullName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <View className="w-8 h-8 rounded-full bg-[#7CB518] mr-3 items-center justify-center">
          <Text className="text-white text-xs font-bold">{initials}</Text>
        </View>
      );
    }

    return (
      <View className="w-8 h-8 rounded-full bg-gray-300 mr-3 items-center justify-center">
        <Ionicons name="person" size={16} color="#666" />
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7CB518" />
      </View>
    );
  }

  if (!stadium) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Không tìm thấy thông tin sân bóng</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Banner as header with overlayed buttons */}
      <View className="w-full h-48 relative">
        <Image
          source={
            stadium.bannerUrl
              ? { uri: stadium.bannerUrl }
              : images.defaultBanner
          }
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}
          className="bg-white/80 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#7CB518" />
        </TouchableOpacity>
        {/* Share button */}
        <TouchableOpacity
          onPress={() => {}}
          style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}
          className="bg-white/80 rounded-full p-2"
        >
          <Ionicons name="share-social" size={22} color="#7CB518" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Card info */}
        <View className="bg-white rounded-t-3xl -mt-6 pb-4 px-5 shadow-md">
          {/* Stadium Name */}
          <Text className="text-2xl font-bold mt-6 mb-2">{stadium.name}</Text>

          {/* Operating hours */}
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="calendar-today" size={18} color="#7CB518" />
            <Text className="ml-2 text-gray-700">
              {stadium.startTime && stadium.endTime
                ? `${stadium.startTime} - ${stadium.endTime}`
                : "Liên hệ để biết giờ hoạt động"}
            </Text>
          </View>

          {/* Address */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={18} color="#7CB518" />
            <Text className="ml-2 text-gray-700 flex-1">
              {stadium.googleMap || "Chưa có địa chỉ"}
            </Text>
          </View>

          {/* Xem trên bản đồ button */}
          {stadium.googleMap && (
            <TouchableOpacity
              className="mt-2 mb-2 self-start px-4 py-2 rounded-lg bg-[#E6F4EA]"
              onPress={() =>
                stadium.googleMap && Linking.openURL(stadium.googleMap)
              }
            >
              <Text className="text-[#7CB518] font-medium">
                Xem trên bản đồ
              </Text>
            </TouchableOpacity>
          )}

          <View className="border-b border-gray-200 my-4" />

          {/* Sports */}
          <Text className="font-bold text-base mb-2">Các môn hiện có</Text>
          <Text className="text-xs text-gray-500 mb-2">
            (Nhấn để xem bảng giá)
          </Text>
          <View className="flex-row mb-4">
            {stadium.sports?.map((sport, idx) => (
              <TouchableOpacity
                key={idx}
                className="flex-row items-center px-4 py-2 mr-2 rounded-full border border-[#C7D7B5] bg-white"
                onPress={() => {}}
              >
                <Ionicons name="tennisball" size={16} color="#7CB518" />
                <Text className="ml-2 text-[#444] font-medium">{sport}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reviews */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-base">Đánh giá</Text>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/stadium-booking/review",
                  params: { stadiumId: stadium.id },
                });
              }}
              className="p-1"
            >
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#7CB518"
              />
            </TouchableOpacity>
          </View>
          {reviewStatsLoading ? (
            <ActivityIndicator size="small" color="#7CB518" />
          ) : reviewStats ? (
            <>
              <View className="flex-row items-center mb-2">
                <Text className="text-lg font-bold text-[#444] mr-2">
                  {reviewStats.averageRating.toFixed(1)}
                </Text>
                {[1, 2, 3, 4, 5].map((i) => (
                  <FontAwesome
                    key={i}
                    name="star"
                    size={18}
                    color={
                      i <= Math.round(reviewStats.averageRating)
                        ? "#FFD600"
                        : "#E0E0E0"
                    }
                  />
                ))}
                <Text className="ml-2 text-gray-500 text-sm">
                  ({reviewStats.totalReviews} đánh giá)
                </Text>
              </View>

              {reviewsLoading ? (
                <ActivityIndicator size="small" color="#7CB518" />
              ) : reviews.length > 0 ? (
                reviews.slice(0, 3).map((review) => (
                  <View key={review.id} className="flex-row items-start mb-3">
                    {renderUserAvatar(review.user)}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-bold text-sm text-gray-900">
                          {review.user.fullName || "Người dùng ẩn danh"}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-green-600 font-bold text-sm mr-1">
                            {review.rating}
                          </Text>
                          <FontAwesome name="star" size={12} color="#FFD600" />
                        </View>
                      </View>
                      <Text className="text-gray-500 text-xs mb-1">
                        {review.comment}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 text-sm">
                  Chưa có đánh giá nào
                </Text>
              )}
            </>
          ) : (
            <Text className="text-gray-500 text-sm">Chưa có đánh giá nào</Text>
          )}

          {/* Contact info */}
          <Text className="font-bold text-base mt-4 mb-2">Liên hệ</Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="call" size={18} color="#7CB518" />
            <Text className="ml-2 text-gray-700">
              SDT: {stadium.phone || "-"}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="email" size={18} color="#7CB518" />
            <Text className="ml-2 text-gray-700">
              Mail: {stadium.email || "-"}
            </Text>
          </View>
        </View>
      </ScrollView>
      {/* Đặt lịch button at the bottom */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-[#7CB518] rounded-xl py-3 items-center"
          onPress={() => {
            router.push({
              pathname: "/stadium-booking/booking-detail",
              params: { stadiumId: stadium.id },
            });
          }}
        >
          <Text className="text-white font-bold text-lg">Đặt lịch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const options = {
  headerShown: false,
};
