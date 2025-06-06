import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import StadiumCard from "../../components/StadiumCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 220;
const CARD_SPACING = 16;
const SNAP_TO = CARD_WIDTH + CARD_SPACING;

const stadiums = [
  {
    id: 1,
    name: "Sân ABC",
    rating: 4.8,
    distance: "2.6 km",
    address: "Số 12, Đường A3, P. Long...",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // placeholder
  },
  {
    id: 2,
    name: "Sân ABC",
    rating: 5,
    distance: "2.6 km",
    address: "Số 12, Đường A3, P. Long...",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // placeholder
  },
  {
    id: 3,
    name: "Sân ABC",
    rating: 3,
    distance: "2.6 km",
    address: "Số 12, Đường A3, P. Long...",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // placeholder
  },
  // Add more stadiums as needed
];

export default function StadiumBooking() {
  const scrollX = useRef(new Animated.Value(0)).current;
  return (
    <View className="flex-1">
      {/* Map as full background */}
      <Image
        source={{
          uri: "https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=220&height=600&center=lonlat%3A-122.29009844646316%2C47.54607447032754&zoom=14.3497&marker=lonlat%3A-122.29188334609739%2C47.54403990655936%3Btype%3Aawesome%3Bcolor%3A%23bb3f73%3Bsize%3Ax-large%3Bicon%3Apaw%7Clonlat%3A-122.29282631194182%2C47.549609195001494%3Btype%3Amaterial%3Bcolor%3A%234c905a%3Bicon%3Atree%3Bicontype%3Aawesome%7Clonlat%3A-122.28726954893025%2C47.541766557545884%3Btype%3Amaterial%3Bcolor%3A%234c905a%3Bicon%3Atree%3Bicontype%3Aawesome&apiKey=e90c906725fb46078c2f67ab5d8c60b1",
        }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />
      {/* Optional: Overlay for readability */}
      <View className="absolute w-full h-full bg-white/70" />

      {/* Foreground content */}
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 pt-8 pb-2 bg-white">
          <View>
            <Text className="font-bold text-base text-[#222]">
              Nguyễn Văn A
            </Text>
            <Text className="text-xs text-[#888]">Quận 9, TP. HCM</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#222"
              style={{ marginRight: 12 }}
            />
            <Ionicons name="person-circle-outline" size={30} color="#7CB518" />
          </View>
        </View>

        {/* Search and Filter */}
        <View className="px-4 pb-2 bg-white">
          <TextInput
            className="bg-[#E6F4EA] rounded-lg px-3 py-2 text-sm mb-2 text-[#222]"
            placeholder="...Tìm kiếm"
            placeholderTextColor="#A0A0A0"
          />
          <View className="flex-row items-center justify-between">
            <TouchableOpacity className="flex-row items-center bg-[#E6F4EA] rounded-lg px-3 py-1.5">
              <Text className="text-[#7CB518] font-medium mr-1">
                Tất cả các sân
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color="#7CB518"
              />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center ml-3">
              <Ionicons name="filter" size={20} color="#7CB518" />
              <Text className="text-[#7CB518] ml-1 font-medium">Sắp xếp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stadium Cards */}
        <View
          className="absolute left-0 right-0"
          style={{ bottom: 100, height: 215 }}
        >
          <Animated.FlatList
            data={stadiums}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              paddingHorizontal: (width - CARD_WIDTH) / 2,
            }}
            snapToInterval={SNAP_TO}
            decelerationRate={"fast"}
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * SNAP_TO,
                index * SNAP_TO,
                (index + 1) * SNAP_TO,
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.85, 1, 0.85],
                extrapolate: "clamp",
              });
              return (
                <StadiumCard
                  name={item.name}
                  rating={item.rating}
                  distance={item.distance}
                  address={item.address}
                  image={item.image}
                  onPressBook={() =>
                    router.push({
                      pathname: "/stadium-booking/stadium-detail",
                      params: { stadium: JSON.stringify(item) },
                    })
                  }
                  scale={scale}
                />
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}
