import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CREATE_REVIEW,
  GET_REVIEW_STATS,
  GET_STADIUM_REVIEWS,
} from "../../graphql";

export default function SubmitReviewScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const {
    reservationId,
    stadiumId,
    stadiumName,
    date,
    startTime,
    endTime,
    courtNumber,
    sport,
  } = params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suppress console errors for expected business logic errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(" ");
      // Don't show "Review already exists" errors in console
      if (
        message.includes("Review already exists") ||
        message.includes("ApolloError: Review already exists")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const [createReview] = useMutation(CREATE_REVIEW, {
    // Refetch queries after successful mutation
    refetchQueries: [
      {
        query: GET_STADIUM_REVIEWS,
        variables: { stadiumId: parseInt(stadiumId as string) },
      },
      {
        query: GET_REVIEW_STATS,
        variables: { stadiumId: parseInt(stadiumId as string) },
      },
    ],
  });

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá.");
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert("Thông báo", "Vui lòng nhập nhận xét của bạn.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đánh giá.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        reservationId: parseInt(reservationId as string),
        stadiumId: parseInt(stadiumId as string),
        userId: user.id,
        rating,
        comment: comment.trim(),
      };

      console.log("🔄 Submitting review:", reviewData);

      await createReview({
        variables: {
          createReviewInput: reviewData,
        },
      });

      console.log("✅ Review submitted successfully");

      Alert.alert(
        "Thành công",
        "Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ giúp cải thiện chất lượng dịch vụ.",
        [
          {
            text: "Xem tất cả đánh giá",
            onPress: () => {
              router.replace({
                pathname: "/stadium-booking/review",
                params: {
                  stadiumId: stadiumId as string,
                  stadiumName: stadiumName as string,
                },
              });
            },
          },
          {
            text: "Đóng",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      // Check if this is the expected "Review already exists" error
      const isReviewExistsError = error.message?.includes(
        "Review already exists"
      );

      if (!isReviewExistsError) {
        // Only log unexpected errors to console
        console.error("Error submitting review:", error);
      }

      // Handle specific error cases
      let errorMessage = "Không thể gửi đánh giá. Vui lòng thử lại sau.";
      let errorTitle = "Lỗi";

      if (!isReviewExistsError) {
        console.log("🔄 Error message:", error.message);
      }
      if (error.message?.includes("Review already exists")) {
        errorTitle = "Đã đánh giá";
        errorMessage =
          "Bạn đã đánh giá cho lịch đặt này rồi. Mỗi lịch đặt chỉ có thể đánh giá một lần.";

        // Navigate back since they can't submit another review
        Alert.alert(errorTitle, errorMessage, [
          {
            text: "Xem đánh giá của tôi",
            onPress: () => {
              router.replace({
                pathname: "/stadium-booking/review",
                params: {
                  stadiumId: stadiumId as string,
                  stadiumName: stadiumName as string,
                },
              });
            },
          },
          {
            text: "Đóng",
            onPress: () => router.back(),
          },
        ]);
        return;
      } else if (error.message?.includes("not found")) {
        errorMessage = "Không tìm thấy thông tin lịch đặt.";
      } else if (error.message?.includes("not completed")) {
        errorMessage = "Chỉ có thể đánh giá sau khi hoàn thành lịch đặt.";
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        errorMessage = "Không có kết nối mạng. Vui lòng kiểm tra và thử lại.";
      } else if (error.message?.includes("GraphQLError")) {
        // Extract the actual error message from GraphQL error
        const graphqlError = error.message.split("GraphQLError: ")[1];
        if (graphqlError) {
          if (graphqlError.includes("Review already exists")) {
            errorTitle = "Đã đánh giá";
            errorMessage =
              "Bạn đã đánh giá cho lịch đặt này rồi. Mỗi lịch đặt chỉ có thể đánh giá một lần.";

            Alert.alert(errorTitle, errorMessage, [
              {
                text: "Xem đánh giá của tôi",
                onPress: () => {
                  router.replace({
                    pathname: "/stadium-booking/review",
                    params: {
                      stadiumId: stadiumId as string,
                      stadiumName: stadiumName as string,
                    },
                  });
                },
              },
              {
                text: "Đóng",
                onPress: () => router.back(),
              },
            ]);
            return;
          } else {
            errorMessage = graphqlError;
          }
        }
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          className="mx-1"
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color={i <= rating ? "#FFD700" : "#D1D5DB"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return "Rất không hài lòng";
      case 2:
        return "Không hài lòng";
      case 3:
        return "Bình thường";
      case 4:
        return "Hài lòng";
      case 5:
        return "Rất hài lòng";
      default:
        return "Chọn số sao để đánh giá";
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F5F5]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View className="w-full h-32 relative border-b-primary border-b-2">
        <View className="flex-row items-center justify-center mt-16">
          <TouchableOpacity
            className="absolute left-4"
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={40}
              color="#7CB518"
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-primary">Viết đánh giá</Text>
          <TouchableOpacity
            className="absolute right-4"
            onPress={() => {
              router.push({
                pathname: "/stadium-booking/review",
                params: {
                  stadiumId: stadiumId as string,
                  stadiumName: stadiumName as string,
                },
              });
            }}
          >
            <Text className="text-primary font-semibold">Xem đánh giá</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Reservation Info Card */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Thông tin lịch đặt
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Sân:</Text>
              <Text className="font-medium text-gray-900">{stadiumName}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Môn thể thao:</Text>
              <Text className="font-medium text-gray-900">{sport}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Số sân:</Text>
              <Text className="font-medium text-gray-900">
                Sân {courtNumber}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Ngày:</Text>
              <Text className="font-medium text-gray-900">
                {new Date(date as string).toLocaleDateString("vi-VN")}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Giờ:</Text>
              <Text className="font-medium text-gray-900">
                {startTime} - {endTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
            Bạn đánh giá dịch vụ như thế nào?
          </Text>

          <View className="flex-row justify-center items-center mb-4">
            {renderStars()}
          </View>

          <Text className="text-center text-gray-600 font-medium">
            {getRatingText()}
          </Text>
        </View>

        {/* Comment Section */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Chia sẻ trải nghiệm của bạn
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-900 min-h-[120px]"
            placeholder="Nhận xét về chất lượng sân, dịch vụ, tiện ích, nhân viên..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />

          <Text className="text-right text-gray-500 text-sm mt-2">
            {comment.length}/500
          </Text>
        </View>

        {/* Tips Section */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-700 font-semibold ml-2">
              Gợi ý viết đánh giá
            </Text>
          </View>
          <Text className="text-blue-600 text-sm leading-5">
            • Chất lượng sân và tiện ích{"\n"}• Thái độ phục vụ của nhân viên
            {"\n"}• Vệ sinh và an toàn{"\n"}• Giá cả so với chất lượng{"\n"}•
            Bạn có giới thiệu cho người khác không?
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={handleSubmitReview}
          disabled={isSubmitting || rating === 0 || comment.trim().length === 0}
          className={`rounded-lg py-4 px-4 ${
            isSubmitting || rating === 0 || comment.trim().length === 0
              ? "bg-gray-400"
              : "bg-primary"
          }`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
