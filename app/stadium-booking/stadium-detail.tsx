import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import StadiumContact from "../../components/StadiumContact";
import StadiumRatings from "../../components/StadiumRatings";
import StadiumReviews from "../../components/StadiumReviews";
import StadiumSports from "../../components/StadiumSports";

const { width } = Dimensions.get("window");

// Map sports từ API sang display format
const mapSportsToDisplay = (sports: string[] = []) => {
  const sportMap: { [key: string]: string } = {
    football: "Bóng đá",
    futsal: "Futsal", 
    badminton: "Cầu lông",
    tennis: "Tennis",
    volleyball: "Bóng chuyền",
    basketball: "Bóng rổ",
    tableTennis: "Bóng bàn"
  };
  
  return sports.map(sport => ({
    key: sport,
    label: sportMap[sport] || sport
  }));
};

// Format time hiển thị
const formatSchedule = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) {
    return "Liên hệ để biết giờ hoạt động";
  }
  return `Hàng ngày: ${startTime} - ${endTime}`;
};

// Mock reviews - có thể thay bằng API sau
const reviews = [
  {
    id: 1,
    name: "Khách hàng",
    rating: 5,
    comment: "Sân đẹp, dịch vụ tốt.",
  },
  {
    id: 2,
    name: "Người dùng",
    rating: 4,
    comment: "Giá cả hợp lý, tiện ích đầy đủ.",
  },
];

export default function StadiumDetail() {
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams();
  const stadium = JSON.parse(params.stadium as string);
  
  // Debug log - Stadium detail
  console.log('\n🏟️ === STADIUM DETAIL PAGE LOADED ===');
  console.log('📊 Stadium Data:', JSON.stringify(stadium, null, 2));
  console.log('📋 Available Fields:');
  console.log('   - Basic:', {
    id: stadium.id,
    name: stadium.name,
    phone: stadium.phone,
    email: stadium.email,
    website: stadium.website
  });
  console.log('   - Media:', {
    avatarUrl: !!stadium.avatarUrl,
    bannerUrl: !!stadium.bannerUrl,
    galleryCount: stadium.galleryUrls?.length || 0,
    pricingImagesCount: stadium.pricingImages?.length || 0
  });
  console.log('   - Payment:', {
    bank: stadium.bank,
    accountName: stadium.accountName,
    accountNumber: stadium.accountNumber,
    otherPaymentsCount: stadium.otherPayments?.length || 0
  });
  console.log('   - Additional:', {
    sportsCount: stadium.sports?.length || 0,
    description: !!stadium.description,
    otherInfo: !!stadium.otherInfo,
    otherContactsCount: stadium.otherContacts?.length || 0
  });
  console.log('🏟️ === END STADIUM DETAIL DEBUG ===\n');
  
  // Process stadium data
  const stadiumSports = mapSportsToDisplay(stadium.sports);
  const scheduleText = formatSchedule(stadium.startTime, stadium.endTime);
  
  // Prioritize banner, then avatar, then gallery, then fallback
  const stadiumImage = stadium.bannerUrl || 
                      stadium.avatarUrl || 
                      (stadium.galleryUrls && stadium.galleryUrls[0]) ||
                      stadium.image || 
                      (stadium.images && stadium.images[0]) || 
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image with overlay buttons */}
        <View className="w-full h-44 relative">
          <Image
            source={{ uri: stadiumImage }}
            className="w-full h-full rounded-b-2xl"
          />
          <TouchableOpacity
            className="absolute top-4 left-4 bg-white rounded-full p-1.5 shadow"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow">
            <Ionicons name="share-social-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Stadium Info */}
        <View className="px-4 py-4">
          <Text className="font-bold text-xl text-gray-900 mb-1">
            {stadium.name}
          </Text>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="calendar-today" size={18} color="#888" />
            <Text className="ml-1 text-gray-600 text-sm">
              {scheduleText}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={18} color="#888" />
            <Text className="ml-1 text-gray-600 text-sm flex-1 flex-wrap">
              {stadium.address || 
               (stadium.googleMap && !stadium.googleMap.includes('maps.google.com') ? stadium.googleMap : '') || 
               "Địa chỉ chưa cập nhật"}
            </Text>
          </View>
          {(stadium.googleMap || stadium.address) && (
            <TouchableOpacity 
              className="mt-2 self-start bg-green-50 rounded-lg px-4 py-1.5"
              onPress={() => {
                const query = encodeURIComponent(stadium.address || stadium.googleMap || stadium.name);
                const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                // TODO: Thêm logic mở link hoặc navigate tới map screen
                console.log('Open map:', url);
              }}
            >
              <Text className="text-green-600 font-bold text-sm">
                📍 Xem trên bản đồ
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sports */}
        <View className="h-px bg-gray-200 my-3" />
        <View className="px-4 pt-2">
          <Text className="font-bold text-base text-gray-900">
            Các môn hiện có
          </Text>
          <Text className="text-gray-500 text-xs mb-1">
            (Nhấn để xem bảng giá)
          </Text>
          <StadiumSports sports={stadiumSports} />
        </View>

        {/* Ratings & Reviews */}
        <View className="h-px bg-gray-200 my-3" />
        <View className="px-4 pt-2">
          <StadiumRatings rating={stadium.rating || 0} />
          <StadiumReviews reviews={reviews} />
        </View>

        {/* Stadium Info */}
        {stadium.description && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Mô tả</Text>
              <Text className="text-gray-600 text-sm leading-5">
                {stadium.description}
              </Text>
            </View>
          </>
        )}

        {/* Additional Info */}
        {stadium.otherInfo && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Thông tin thêm</Text>
              <Text className="text-gray-600 text-sm leading-5">
                {stadium.otherInfo}
              </Text>
            </View>
          </>
        )}

        {/* Pricing */}
        {stadium.price && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Giá thuê</Text>
              <View className="bg-green-50 rounded-lg p-3">
                <Text className="text-green-700 font-bold text-lg">
                  {stadium.price.toLocaleString('vi-VN')}đ/giờ
                </Text>
                {stadium.area && (
                  <Text className="text-green-600 text-sm mt-1">
                    Diện tích: {stadium.area}m²
                  </Text>
                )}
                {stadium.numberOfFields && (
                  <Text className="text-green-600 text-sm">
                    Số sân: {stadium.numberOfFields}
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        {/* Payment Info */}
        {(stadium.bank || stadium.accountName || stadium.accountNumber || (stadium.otherPayments && stadium.otherPayments.length > 0)) && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Thông tin thanh toán</Text>
              
              {/* Bank info */}
              {stadium.bank && (
                <View className="bg-green-50 rounded-lg p-3 mb-3">
                  <Text className="font-medium text-green-700 mb-1">Chuyển khoản ngân hàng:</Text>
                  <Text className="text-gray-700 text-sm">
                    🏦 Ngân hàng: {stadium.bank}
                  </Text>
                  {stadium.accountName && (
                    <Text className="text-gray-700 text-sm">
                      👤 Chủ tài khoản: {stadium.accountName}
                    </Text>
                  )}
                  {stadium.accountNumber && (
                    <Text className="text-gray-700 text-sm">
                      💳 Số tài khoản: {stadium.accountNumber}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Other payment methods */}
              {stadium.otherPayments && stadium.otherPayments.length > 0 && (
                <View>
                  <Text className="font-medium text-gray-700 mb-2">Phương thức thanh toán khác:</Text>
                  {stadium.otherPayments.map((payment: string, index: number) => (
                    <View key={index} className="bg-blue-50 rounded-lg p-2 mb-2">
                      <Text className="text-blue-700 text-sm">💰 {payment}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Pricing Images */}
        {stadium.pricingImages && stadium.pricingImages.length > 0 && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Bảng giá chi tiết</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {stadium.pricingImages.map((imageUrl: string, index: number) => (
                    <View key={index} className="mr-3">
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-64 h-40 rounded-lg"
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        {/* Gallery */}
        {stadium.galleryUrls && stadium.galleryUrls.length > 0 && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Hình ảnh sân bóng</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {stadium.galleryUrls.map((imageUrl: string, index: number) => (
                    <View key={index} className="mr-3">
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-48 h-32 rounded-lg"
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        {/* Banner */}
        {stadium.bannerUrl && (
          <>
            <View className="h-px bg-gray-200 my-3" />
            <View className="px-4 pt-2">
              <Text className="font-bold text-base text-gray-900 mb-2">Banner</Text>
              <Image
                source={{ uri: stadium.bannerUrl }}
                className="w-full h-32 rounded-lg"
                resizeMode="cover"
              />
            </View>
          </>
        )}

        {/* Contact */}
        <View className="h-px bg-gray-200 my-3" />
        <View className="px-4 pt-2">
          <Text className="font-bold text-base text-gray-900">Liên hệ</Text>
          <StadiumContact 
            phone={stadium.phone || "Chưa cập nhật"} 
            email={stadium.email || "Chưa cập nhật"} 
          />
          
          {/* Other contacts */}
          {stadium.otherContacts && stadium.otherContacts.length > 0 && (
            <View className="mt-3">
              <Text className="font-medium text-gray-700 mb-2">Liên hệ khác:</Text>
              {stadium.otherContacts.map((contact: string, index: number) => (
                <Text key={index} className="text-gray-600 text-sm mb-1">
                  • {contact}
                </Text>
              ))}
            </View>
          )}
          
          {/* Website */}
          {stadium.website && (
            <TouchableOpacity className="mt-3 bg-blue-50 rounded-lg p-3">
              <Text className="text-blue-600 font-medium">
                🌐 {stadium.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {/* Fixed bottom button */}
      <View className="absolute left-0 right-0 bottom-0 bg-white p-4 rounded-t-2xl shadow-lg">
        <AppButton
          title="Đặt lịch"
          onPress={() => {
            router.push("/stadium-booking/booking-detail");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export const options = {
  headerShown: false,
};
