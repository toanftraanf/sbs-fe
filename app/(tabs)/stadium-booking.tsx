import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import StadiumCard from "../../components/StadiumCard";
import useStadiumBooking from "../../hooks/useStadiumBooking";
import { CARD_WIDTH, SNAP_TO, StadiumMapData } from "../../types/stadium";

const { width } = Dimensions.get("window");

export default function StadiumBooking() {
  const {
    scrollX,
    mapRef,
    selectedStadium,
    currentLocation,
    stadiums,
    loading,
    searchQuery,
    setSearchQuery,
    currentAddress,
    handleSearch,
    handleMarkerPress,
    getCurrentLocation,
  } = useStadiumBooking();

  // Ref for the card list
  const cardListRef = useRef(null);

  if (!currentLocation) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5A983B" />
        <Text className="text-gray-500 mt-4">Đang tải bản đồ...</Text>
      </View>
    );
  }

  // Accept index as a parameter
  const renderMarker = (stadium: StadiumMapData, index: number) => {
    const isSelected = selectedStadium === stadium.id;
    // Debug log for stadium coordinates
    console.log("Stadium marker:", stadium.name, stadium.coordinate);
    if (
      !stadium.coordinate ||
      typeof stadium.coordinate.latitude !== "number" ||
      typeof stadium.coordinate.longitude !== "number"
    ) {
      // Render a fallback marker at (0,0) if coordinate is invalid
      return (
        <Marker
          key={stadium.id}
          coordinate={{ latitude: 0, longitude: 0 }}
          title={stadium.name + " (Invalid coordinate)"}
          pinColor="red"
        >
          <Callout>
            <Text>Invalid coordinate</Text>
          </Callout>
        </Marker>
      );
    }
    return (
      <Marker
        key={stadium.id}
        coordinate={stadium.coordinate}
        onPress={() => {
          (cardListRef.current as any)?.scrollTo({
            x: index * (CARD_WIDTH + 16),
            animated: true,
          });
          handleMarkerPress(stadium.id);
        }}
      >
        <View className="items-center">
          <Text className="mt-1 mb-1 text-xs font-semibold text-[#222] bg-white px-2 py-0.5 rounded-full border border-[#5A983B]">
            {stadium.name}
          </Text>
          <View
            className={`p-2 rounded-lg border border-[#5A983B] ${
              isSelected ? "bg-[#5A983B]" : "bg-white"
            }`}
          >
            <Ionicons
              name="tennisball-outline"
              size={24}
              color={isSelected ? "white" : "#5A983B"}
            />
          </View>
        </View>
      </Marker>
    );
  };

  return (
    <View className="flex-1">
      <MapView
        key={stadiums.map((s) => s.id).join(",")}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={currentLocation}
          title="Vị trí của bạn"
          pinColor="#0000FF"
        >
          <Callout>
            <Text>Vị trí hiện tại của bạn</Text>
          </Callout>
        </Marker>
        {/* Pass index to renderMarker */}
        {stadiums.map((stadium, index) => renderMarker(stadium, index))}
      </MapView>

      {/* Header with search bar and locate icon */}
      <View className="absolute top-12 left-4 right-4">
        <View className="flex-row items-center justify-between mb-4">
          {/* Search Bar */}
          <View className="flex-row items-center flex-1 bg-white rounded-xl shadow-sm p-4 mr-2">
            <Ionicons name="location" size={20} color="#5A983B" />
            <Text className="ml-2 text-gray-600 flex-1" numberOfLines={1}>
              {currentAddress}
            </Text>
            <View className="w-px h-6 bg-gray-200 mx-2" />
            <TextInput
              placeholder="Tìm kiếm sân..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              className="flex-1 ml-2"
            />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#5A983B" />
            </TouchableOpacity>
          </View>
          {/* Locate Icon */}
          <TouchableOpacity
            onPress={getCurrentLocation}
            className="bg-white p-2 rounded-full shadow-sm ml-2"
          >
            <Ionicons name="locate" size={24} color="#5A983B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <ActivityIndicator size="large" color="#5A983B" />
        </View>
      )}

      {/* Bottom Scrolling Cards */}
      {stadiums.length > 0 && (
        <Animated.ScrollView
          ref={cardListRef}
          horizontal
          pagingEnabled
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_TO}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          className="absolute left-0 right-0 bottom-24"
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2,
            paddingBottom: 32,
          }}
        >
          {stadiums.map((stadium, index) => (
            <StadiumCard
              key={stadium.id}
              stadium={stadium as StadiumMapData}
              index={index}
              scrollX={scrollX}
              onPress={() =>
                router.push({
                  pathname: "/stadium-booking/stadium-detail",
                  params: { stadiumId: stadium.id.toString() },
                })
              }
            />
          ))}
        </Animated.ScrollView>
      )}
    </View>
  );
}
