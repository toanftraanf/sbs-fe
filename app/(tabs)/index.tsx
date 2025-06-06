import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";

import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const fakeUser = {
  name: "Trần Hữu E",
  stadium: "Sân A",
};

const fakeSchedule = [
  { day: "Sun", date: 16 },
  { day: "Mon", date: 17 },
  { day: "Tue", date: 18 },
  { day: "Wed", date: 19 },
  { day: "Thu", date: 20, active: true },
  { day: "Fri", date: 21 },
  { day: "Sat", date: 22 },
];

const fakeOrdersToday = [
  {
    name: "Nguyễn Văn A",
    type: "Quần vợt",
    time: "13:00 - 15:00",
    date: "28/03/2025",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

const fakeOrdersPending = [
  {
    name: "Đặng Thị H",
    type: "Quần vợt",
    time: "06:00 - 09:00",
    date: "30/03/2025",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];
export default function UserHomeRedirect() {
  const { user } = { user: { role: "user" } };

  if (user?.role === "owner") {
    return (
      <>
        <View className="flex-1 bg-[#F5F5F5]">
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View className="bg-white rounded-b-2xl px-5 pt-8 pb-4">
              <View className="flex-row justify-between items-center mb-2">
                <View>
                  <Text className="font-InterBold text-base text-secondary">
                    {fakeUser.name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {fakeUser.stadium}
                  </Text>
                </View>
                <View className="flex-row items-center space-x-4">
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#5A983B"
                  />
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#515151"
                  />
                  <Ionicons
                    name="person-circle-outline"
                    size={28}
                    color="#5A983B"
                  />
                </View>
              </View>
              {/* Search */}
              <View className="bg-[#EAF6E6] rounded-xl flex-row items-center px-3 py-2 mt-2">
                <Ionicons name="search" size={18} color="#5A983B" />
                <TextInput
                  placeholder="Tìm kiếm"
                  placeholderTextColor="#A3A3A3"
                  className="flex-1 ml-2 text-sm"
                />
              </View>
            </View>

            {/* Schedule */}
            <View className="bg-[#EAF6E6] px-5 py-3">
              <Text className="text-xs text-gray-400 mb-2">
                Lịch trình của bạn
              </Text>
              <View className="flex-row justify-between mb-2">
                {fakeSchedule.map((item, idx) => (
                  <View
                    key={idx}
                    className={`items-center px-1 ${
                      item.active ? "bg-primary rounded-xl" : ""
                    }`}
                    style={item.active ? { minWidth: 40 } : {}}
                  >
                    <Text
                      className={`text-xs ${
                        item.active ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {item.day}
                    </Text>
                    <Text
                      className={`text-base font-InterBold ${
                        item.active ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {item.date}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-xs text-gray-700">
                Nguyễn Văn A - 13h00 đến 15h00
              </Text>
            </View>

            {/* Quick Actions */}
            <View className="flex-row justify-between px-5 mt-4">
              <TouchableOpacity className="flex-1 bg-white rounded-xl items-center py-4 mr-2">
                <Ionicons name="people-outline" size={28} color="#5A983B" />
                <Text className="font-InterBold text-primary mt-2">
                  Khách hàng
                </Text>
                <Text className="text-xs text-gray-400 text-center mt-1">
                  Lịch sử khách hàng và đánh giá gần đây
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white rounded-xl items-center py-4 ml-2">
                <MaterialIcons name="analytics" size={28} color="#5A983B" />
                <Text className="font-InterBold text-primary mt-2">
                  Kinh doanh
                </Text>
                <Text className="text-xs text-gray-400 text-center mt-1">
                  Thông tin hoạt động và tiếp cận sân tập
                </Text>
              </TouchableOpacity>
            </View>

            {/* Orders Section */}
            <View className="px-5 mt-4">
              <TouchableOpacity className="bg-white rounded-xl flex-row items-center p-4 mb-2">
                <Ionicons name="list-outline" size={28} color="#5A983B" />
                <View className="ml-3">
                  <Text className="font-InterBold text-primary">
                    Các đơn của bạn
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Lịch đơn hôm nay và sắp tới
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Today's Orders */}
            <View className="px-5 mt-2">
              <Text className="font-InterBold text-gray-700 mb-2">
                Đơn hôm nay (2)
              </Text>
              {fakeOrdersToday.map((order, idx) => (
                <View
                  key={idx}
                  className="bg-white rounded-xl flex-row items-center p-3 mb-2 shadow-sm"
                >
                  <Image
                    source={{ uri: order.avatar }}
                    className="w-12 h-12 rounded-lg"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-InterBold text-gray-900">
                      {order.name}
                    </Text>
                    <Text className="text-xs text-gray-400">{order.type}</Text>
                    <Text className="text-xs text-gray-700">{order.time}</Text>
                    <Text className="text-xs text-gray-700">
                      Date: {order.date}
                    </Text>
                  </View>
                  <Ionicons name="pencil-outline" size={18} color="#515151" />
                </View>
              ))}
            </View>

            {/* Pending Orders */}
            <View className="px-5 mt-2">
              <Text className="font-InterBold text-gray-700 mb-2">
                Đơn chờ xác nhận (3)
              </Text>
              {fakeOrdersPending.map((order, idx) => (
                <View
                  key={idx}
                  className="bg-white rounded-xl flex-row items-center p-3 mb-2 shadow-sm"
                >
                  <Image
                    source={{ uri: order.avatar }}
                    className="w-12 h-12 rounded-lg"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-InterBold text-gray-900">
                      {order.name}
                    </Text>
                    <Text className="text-xs text-gray-400">{order.type}</Text>
                    <Text className="text-xs text-gray-700">{order.time}</Text>
                    <Text className="text-xs text-gray-700">
                      Date: {order.date}
                    </Text>
                  </View>
                  <Ionicons name="pencil-outline" size={18} color="#515151" />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </>
    );
  } else if (user?.role === "user") {
    return (
      <>
        <View className="flex-1 bg-white">
          {/* Green Header */}
          <View style={{ backgroundColor: "#E6F4EA" }}>
            <View className="flex-row items-center justify-between px-4 pt-10 pb-2">
              <View>
                <Text className="font-InterBold text-lg">Nguyễn Văn A</Text>
                <Text className="text-xs text-gray-500">Quận 9, TP. HCM</Text>
              </View>
              <View className="flex-row items-center space-x-4">
                <Ionicons name="notifications-outline" size={24} color="#222" />
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color="#222"
                />
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              </View>
            </View>
            {/* Search */}
            <View className="flex-row items-center bg-[#F2F8F6] rounded-xl px-3 py-2 mx-4 mb-2">
              <Ionicons name="search" size={20} color="#B0B0B0" />
              <TextInput
                className="flex-1 ml-2 text-sm"
                placeholder="...Tìm kiếm"
                placeholderTextColor="#B0B0B0"
              />
            </View>
          </View>

          <ScrollView className="flex-1 px-4">
            {/* Lịch trình của bạn */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#E6F4EA]">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-InterBold">Lịch trình của bạn</Text>
                <Text className="text-xs text-gray-400">Month DD YYYY</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (d, i) => (
                    <View key={i} className="items-center">
                      <Text
                        className={`text-xs ${
                          i === 4 ? "text-primary font-bold" : "text-gray-500"
                        }`}
                      >
                        {d}
                      </Text>
                      <Text
                        className={`text-base ${
                          i === 4 ? "text-primary font-bold" : "text-gray-700"
                        }`}
                      >
                        {16 + i}
                      </Text>
                    </View>
                  )
                )}
              </View>
              <Text className="text-xs text-gray-400">Không có lịch..</Text>
            </View>

            {/* Hoạt động gần đây */}
            <TouchableOpacity className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-[#E6F4EA]">
              <Ionicons name="refresh-circle" size={28} color="#4CAF50" />
              <View className="ml-3">
                <Text className="font-InterSemiBold text-gray-700">
                  Hoạt động gần đây
                </Text>
                <Text className="text-xs text-gray-400">
                  Lịch trình và hoạt động gần đây của bạn
                </Text>
              </View>
            </TouchableOpacity>

            {/* Gói PREMIUM */}
            <TouchableOpacity className="bg-[#FFE5B4] rounded-xl p-4 mb-3 flex-row items-center border border-[#FFD580]">
              <MaterialIcons
                name="workspace-premium"
                size={28}
                color="#F9A825"
              />
              <View className="ml-3 flex-1">
                <Text className="font-InterBold text-[#F9A825]">
                  GÓI PREMIUM
                </Text>
                <Text className="text-xs text-[#F9A825]">
                  Mở khóa các đặc quyền và loại bỏ quảng cáo
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tìm và ghép đội */}
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-[#E6F4EA]">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                }}
                className="w-16 h-16 rounded-xl mr-3"
              />
              <View className="flex-1">
                <Text className="font-InterBold mb-1">Tìm và ghép đội</Text>
                <Text className="text-xs text-gray-500">
                  Tìm kiếm, ghép đội và kết nối với những người cùng đam mê với
                  bạn ngay lúc này.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Thành tựu & Nhóm */}
            <View className="flex-row justify-between mb-3">
              <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 mr-2 items-center shadow-sm border border-[#E6F4EA]">
                <Ionicons name="trophy-outline" size={28} color="#4CAF50" />
                <Text className="font-InterBold mt-2">Thành tựu</Text>
                <Text className="text-xs text-gray-500">Huy hiệu của bạn</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 ml-2 items-center shadow-sm border border-[#E6F4EA]">
                <Ionicons name="people-outline" size={28} color="#4CAF50" />
                <Text className="font-InterBold mt-2">Nhóm</Text>
                <Text className="text-xs text-gray-500">Nhóm của bạn</Text>
              </TouchableOpacity>
            </View>

            {/* Sân tập */}
            <View className="mb-6">
              <Text className="font-InterBold mb-2">Sân tập</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2].map((i) => (
                  <View
                    key={i}
                    className="w-48 h-28 bg-[#F2F8F6] rounded-xl mr-4 overflow-hidden border border-[#E6F4EA]"
                  >
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                      }}
                      className="w-full h-2/3"
                      resizeMode="cover"
                    />
                    <View className="px-2 py-1">
                      <Text className="font-InterBold text-sm">Sân ABC</Text>
                      <Text className="text-xs text-gray-500">
                        Số 1, Đường X, H. Long...
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  return null; // or a loading spinner
}
