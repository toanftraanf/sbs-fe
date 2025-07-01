import ScreenHeader from "@/components/ScreenHeader";
import { useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GET_REVIEW_STATS, GET_STADIUM_REVIEWS } from "../../graphql";
import { Review } from "../../types";

interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export default function ReviewScreen() {
  const params = useLocalSearchParams();
  const { stadiumId, stadiumName } = params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  // GraphQL queries
  const {
    data: reviewsData,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery(GET_STADIUM_REVIEWS, {
    variables: { stadiumId: parseInt(stadiumId as string) },
    skip: !stadiumId,
  });

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_REVIEW_STATS, {
    variables: { stadiumId: parseInt(stadiumId as string) },
    skip: !stadiumId,
    errorPolicy: "ignore", // Don't fail if this query doesn't exist
  });

  const loading = reviewsLoading; // Remove statsLoading for now

  useEffect(() => {
    if (reviewsData?.stadiumReviews) {
      console.log("📊 Reviews data received:", reviewsData.stadiumReviews);

      // Debug each review to see avatar data
      reviewsData.stadiumReviews.forEach((review: any, index: number) => {
        console.log(`🔍 Review ${index + 1} user data:`, {
          id: review.user?.id,
          fullName: review.user?.fullName,
          avatarId: review.user?.avatarId,
          avatar: review.user?.avatar,
        });
      });

      setReviews(reviewsData.stadiumReviews);
      // Calculate stats from reviews data directly
      calculateStatsFromReviews(reviewsData.stadiumReviews);
    }
  }, [reviewsData]);

  // Calculate stats from reviews data (fallback if backend stats not available)
  const calculateStatsFromReviews = (reviewsList: Review[]) => {
    const total = reviewsList.length;
    setTotalReviews(total);

    if (total === 0) {
      setAverageRating(0);
      setRatingBreakdown({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      return;
    }

    // Calculate average rating
    const sum = reviewsList.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    setAverageRating(Math.round(average * 10) / 10);

    // Calculate rating breakdown
    const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((review) => {
      breakdown[review.rating as keyof RatingBreakdown]++;
    });
    setRatingBreakdown(breakdown);
  };

  useEffect(() => {
    if (statsData?.reviewStats) {
      console.log("📈 Stats data received:", statsData.reviewStats);
      const stats = statsData.reviewStats;
      setAverageRating(stats.averageRating || 0);
      setTotalReviews(stats.totalReviews || 0);

      // Convert backend format to frontend format
      setRatingBreakdown({
        5: stats.ratingBreakdown?.star5 || 0,
        4: stats.ratingBreakdown?.star4 || 0,
        3: stats.ratingBreakdown?.star3 || 0,
        2: stats.ratingBreakdown?.star2 || 0,
        1: stats.ratingBreakdown?.star1 || 0,
      });
    }
  }, [statsData]);

  // Error handling - only show error for reviews, ignore stats errors
  useEffect(() => {
    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
    }
    if (statsError) {
      console.log(
        "Stats query not available, using calculated stats from reviews"
      );
    }
  }, [reviewsError, statsError]);

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={size}
          color={i <= rating ? "#FFD700" : "#D1D5DB"}
        />
      );
    }
    return stars;
  };

  const getRatingLabel = (starLevel: number) => {
    switch (starLevel) {
      case 5:
        return "Tuyệt vời";
      case 4:
        return "Tốt";
      case 3:
        return "Khá";
      case 2:
        return "Trung bình";
      case 1:
        return "Tệ";
      default:
        return "";
    }
  };

  const getRatingBarColor = (starLevel: number) => {
    switch (starLevel) {
      case 5:
      case 4:
        return "bg-green-500";
      case 3:
        return "bg-yellow-500";
      case 2:
        return "bg-orange-500";
      case 1:
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInDays = Math.floor(
      (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "1 ngày trước";
    return `${diffInDays} ngày trước`;
  };

  const getUserInitial = (fullName: string) => {
    return fullName.charAt(0).toUpperCase();
  };

  const renderUserAvatar = (user: Review["user"]) => {
    // Debug logging to see what we're getting from backend
    console.log("🐛 Avatar Debug - User data:", {
      userId: user.id,
      fullName: user.fullName,
      avatarId: user.avatarId,
      avatar: user.avatar,
      avatarUrl: user.avatar?.url,
    });

    // Check if user has avatar file with url
    if (user.avatar?.url) {
      console.log("✅ Showing real avatar:", user.avatar.url);
      return (
        <Image
          source={{ uri: user.avatar.url }}
          className="w-10 h-10 rounded-full"
          style={{ resizeMode: "cover" }}
          onError={(error) => {
            console.log(
              "❌ Avatar image failed to load:",
              error.nativeEvent.error
            );
            console.log("Failed URL:", user.avatar?.url);
          }}
          onLoad={() => {
            console.log("✅ Avatar image loaded successfully");
          }}
        />
      );
    }

    // Fallback to initials if no avatar file
    console.log("⚠️ Using fallback initials - no avatar data");
    return (
      <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
        <Text className="text-white font-bold text-sm">
          {getUserInitial(user.fullName)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScreenHeader title="Đánh giá" />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7CB518" />
          <Text className="text-gray-600 mt-2">Đang tải đánh giá...</Text>
        </View>
      ) : reviewsError ? (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-gray-700 text-center mt-4 mb-4">
            Không thể tải đánh giá. Vui lòng thử lại.
          </Text>
          <TouchableOpacity
            onPress={() => {
              refetchReviews();
            }}
            className="bg-primary rounded-lg py-2 px-4"
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                refetchReviews();
              }}
              colors={["#7CB518"]}
            />
          }
        >
          {/* Overall Rating Section - Only show if we have data */}
          {totalReviews > 0 && (
            <View className="bg-white p-6 mb-4">
              <View className="items-center mb-6">
                <Text className="text-6xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </Text>
                <View className="flex-row mb-2">
                  {renderStars(Math.round(averageRating), 20)}
                </View>
                <Text className="text-gray-600">
                  Dựa trên {totalReviews} đánh giá
                </Text>
              </View>

              {/* Rating Breakdown */}
              <View className="space-y-2">
                {[5, 4, 3, 2, 1].map((starLevel) => {
                  const count =
                    ratingBreakdown[starLevel as keyof RatingBreakdown];
                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                  return (
                    <View key={starLevel} className="flex-row items-center">
                      <Text className="text-gray-700 w-20 text-sm">
                        {getRatingLabel(starLevel)}
                      </Text>
                      <View className="flex-1 mx-3">
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View
                            className={`h-full ${getRatingBarColor(
                              starLevel
                            )} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                      </View>
                      <Text className="text-gray-500 text-sm w-8 text-right">
                        {count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Individual Reviews */}
          {reviews.length > 0 && (
            <View className="bg-white">
              {reviews.map((review, index) => (
                <View
                  key={review.id}
                  className={`p-4 ${
                    index !== reviews.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View className="flex-row">
                    {/* User Avatar - Now shows real avatar */}
                    <View className="mr-3">
                      {renderUserAvatar(review.user)}
                    </View>

                    {/* Review Content */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-bold text-gray-900">
                          {review.user.fullName}
                        </Text>
                        <View className="flex-row">
                          {renderStars(review.rating, 14)}
                        </View>
                      </View>

                      <Text className="text-gray-500 text-xs mb-2">
                        {getTimeAgo(review.createdAt)}
                      </Text>

                      <Text className="text-gray-700 text-sm leading-5">
                        {review.comment}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!loading && reviews.length === 0 && !reviewsError && (
            <View className="bg-white p-8 items-center">
              <Ionicons name="star-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4 text-lg font-medium">
                Chưa có đánh giá nào
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Hãy là người đầu tiên đánh giá sân này
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
