import {
  getAllStadiums,
  getStadiumsByAddress,
  getStadiumsByName,
} from "@/services/stadium";
import { Stadium } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import StadiumCard from "./StadiumCard";

interface StadiumPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onStadiumSelect: (stadium: Stadium) => void;
  selectedStadium?: Stadium | null;
}

const StadiumPickerModal: React.FC<StadiumPickerModalProps> = ({
  visible,
  onClose,
  onStadiumSelect,
  selectedStadium,
}) => {
  const mapRef = useRef<MapView>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [filteredStadiums, setFilteredStadiums] = useState<Stadium[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Stadium | null>(
    selectedStadium || null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Default region (Vietnam) - will be updated with current location
  const [region, setRegion] = useState<Region>({
    latitude: 10.8231,
    longitude: 106.6297,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (visible) {
      getCurrentLocationAndLoadStadiums();
    }
  }, [visible]);

  useEffect(() => {
    // Only show all stadiums when search is empty
    if (!searchText.trim()) {
      setFilteredStadiums(stadiums);
      setShowSearchResults(false);
    }
  }, [searchText, stadiums]);

  useEffect(() => {
    // Fit map to show all stadium markers
    if (filteredStadiums.length > 0 && mapRef.current) {
      const validStadiums = filteredStadiums.filter(
        (stadium) => stadium.latitude && stadium.longitude
      );

      if (validStadiums.length > 0) {
        if (validStadiums.length === 1) {
          // If only one stadium, center on it
          const stadium = validStadiums[0];
          mapRef.current.animateToRegion(
            {
              latitude: stadium.latitude!,
              longitude: stadium.longitude!,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
        } else {
          // If multiple stadiums, fit to show all
          const coordinates = validStadiums.map((stadium) => ({
            latitude: stadium.latitude!,
            longitude: stadium.longitude!,
          }));

          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    }
  }, [filteredStadiums]);

  const getCurrentLocationAndLoadStadiums = async () => {
    setIsLoadingLocation(true);

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied");
        // Continue with default location and load stadiums
        await loadStadiums();
        setIsLoadingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Update region to current location
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setRegion(newRegion);

      // Animate map to current location if map is ready
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      // Continue with default location if there's an error
    } finally {
      // Load stadiums regardless of location success/failure
      await loadStadiums();
      setIsLoadingLocation(false);
    }
  };

  const loadStadiums = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allStadiums = await getAllStadiums();
      // Filter stadiums that have latitude and longitude
      const stadiumsWithLocation = allStadiums.filter(
        (stadium) => stadium.latitude && stadium.longitude
      );
      setStadiums(stadiumsWithLocation);
      setFilteredStadiums(stadiumsWithLocation);
    } catch (err) {
      console.error("Error loading stadiums:", err);
      setError("Không thể tải danh sách sân tập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchText.trim()) {
      setFilteredStadiums(stadiums);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Search by both name and address in parallel for better results
      const [nameResults, addressResults] = await Promise.allSettled([
        getStadiumsByName(searchText.trim()),
        getStadiumsByAddress(searchText.trim()),
      ]);

      // Combine results and remove duplicates
      const allResults: Stadium[] = [];

      if (nameResults.status === "fulfilled") {
        allResults.push(...nameResults.value);
      }

      if (addressResults.status === "fulfilled") {
        allResults.push(...addressResults.value);
      }

      // Remove duplicates based on stadium ID
      const uniqueResults = allResults.filter(
        (stadium, index, self) =>
          index === self.findIndex((s) => s.id === stadium.id)
      );

      // Filter stadiums that have latitude and longitude
      const resultsWithLocation = uniqueResults.filter(
        (stadium) => stadium.latitude && stadium.longitude
      );

      setFilteredStadiums(resultsWithLocation);
    } catch (err) {
      console.error("Error searching stadiums:", err);
      // Fallback to local filtering if API calls fail
      const filtered = stadiums.filter(
        (stadium) =>
          stadium.name.toLowerCase().includes(searchText.toLowerCase()) ||
          stadium.address?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredStadiums(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStadiumFocus = (stadium: Stadium) => {
    // Focus on the stadium in the map (from search dropdown)
    if (stadium.latitude && stadium.longitude && mapRef.current) {
      const newRegion = {
        latitude: stadium.latitude,
        longitude: stadium.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      mapRef.current.animateToRegion(newRegion, 1000);
      setSelectedMarker(stadium);
      setShowSearchResults(false);
      setSearchText(stadium.name);
    }
  };

  const handleMarkerPress = (stadium: Stadium) => {
    // Just select the marker without changing search text
    setSelectedMarker(stadium);
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSelectedMarker(null);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedMarker) {
      onStadiumSelect(selectedMarker);
      onClose();
    }
  };

  const renderStadiumMarker = (stadium: Stadium) => {
    if (!stadium.latitude || !stadium.longitude) return null;

    const isSelected = selectedMarker?.id === stadium.id;

    return (
      <Marker
        key={stadium.id}
        coordinate={{
          latitude: stadium.latitude,
          longitude: stadium.longitude,
        }}
        onPress={() => handleMarkerPress(stadium)}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View style={{ alignItems: "center" }}>
          {/* Stadium Name Label */}
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              marginBottom: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#374151",
                textAlign: "center",
              }}
            >
              {stadium.name}
            </Text>
            {stadium.price && (
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: "#5A983B",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {`${stadium.price.toLocaleString("vi-VN")}đ`}
              </Text>
            )}
          </View>

          {/* Marker Pin */}
          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: isSelected ? "#5A983B" : "#FF6B6B",
              borderRadius: 15,
              borderWidth: 3,
              borderColor: "white",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Ionicons name="football" size={16} color="white" />
          </View>
        </View>
      </Marker>
    );
  };

  const renderSelectedStadiumInfo = () => {
    if (!selectedMarker) return null;

    // Convert Stadium to StadiumMapData format for StadiumCard
    const stadiumData = {
      id: selectedMarker.id,
      name: selectedMarker.name,
      rating: selectedMarker.rating || 0,
      address: selectedMarker.address || "",
      image: selectedMarker.avatarUrl || selectedMarker.bannerUrl || "",
      coordinate: {
        latitude: selectedMarker.latitude || 0,
        longitude: selectedMarker.longitude || 0,
      },
    };

    return (
      <View className="absolute items-center bottom-4 left-4 right-4 z-10 pb-10">
        <StadiumCard
          stadium={stadiumData}
          index={0}
          scrollX={new Animated.Value(0)}
          onPress={handleConfirmSelection}
          buttonText="Chọn"
        />
      </View>
    );
  };

  const renderSearchResultItem = ({ item: stadium }: { item: Stadium }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-100 flex-row items-center space-x-3 bg-white"
      onPress={() => handleStadiumFocus(stadium)}
      activeOpacity={0.7}
    >
      {/* Stadium Image/Icon */}
      <View className="w-12 h-12 bg-gray-200 rounded-lg items-center justify-center overflow-hidden">
        {stadium.avatarUrl ? (
          <Image
            source={{ uri: stadium.avatarUrl }}
            className="w-full h-full"
          />
        ) : (
          <Ionicons name="business" size={24} color="#6B7280" />
        )}
      </View>

      {/* Stadium Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-base font-semibold text-gray-900 flex-1"
            numberOfLines={1}
          >
            {stadium.name}
          </Text>
          {stadium.rating && (
            <View className="flex-row items-center ml-2">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-sm text-gray-600 ml-1 font-medium">
                {stadium.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
          {stadium.address}
        </Text>

        {/* Sports and Price Row */}
        <View className="flex-row items-center justify-between">
          {/* Sports tags */}
          {stadium.sports && stadium.sports.length > 0 && (
            <View className="flex-row flex-wrap flex-1">
              {stadium.sports.slice(0, 2).map((sport, index) => (
                <View
                  key={index}
                  className="bg-primary/10 px-2 py-1 rounded-full mr-1"
                >
                  <Text className="text-xs text-primary font-medium">
                    {sport}
                  </Text>
                </View>
              ))}
              {stadium.sports.length > 2 && (
                <Text className="text-xs text-gray-500 mt-1">
                  {`+${stadium.sports.length - 2} more`}
                </Text>
              )}
            </View>
          )}

          {/* Price */}
          {stadium.price && (
            <Text className="text-sm text-primary font-semibold ml-2">
              {`${stadium.price.toLocaleString("vi-VN")}đ`}
            </Text>
          )}
        </View>
      </View>

      {/* Arrow indicator */}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderSearchResults = () => {
    if (!showSearchResults || !searchText.trim() || isLoading) {
      return null;
    }

    return (
      <View
        className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 max-h-64 z-20"
        style={{
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {isSearching ? (
          <View className="p-4 items-center">
            <ActivityIndicator size="small" color="#5A983B" />
            <Text className="text-gray-500 mt-2">Đang tìm kiếm...</Text>
          </View>
        ) : filteredStadiums.length === 0 ? (
          <View className="p-4 items-center">
            <Text className="text-gray-500">
              Không tìm thấy sân tập phù hợp
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStadiums.slice(0, 5)} // Limit to 5 results
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={renderSearchResultItem}
          />
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Chọn sân tập
          </Text>
          <View className="w-6" />
        </View>

        {/* Search Bar */}
        <View className="p-4 border-b border-gray-200 bg-white z-10">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Tìm kiếm sân tập... (Nhấn Enter để tìm)"
              value={searchText}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchSubmit}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Map Content */}
        <View className="flex-1 relative">
          {/* Search Results */}
          {renderSearchResults()}

          {isLoading || isLoadingLocation ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#5A983B" />
              <Text className="text-gray-600 mt-4">
                {isLoadingLocation
                  ? "Đang lấy vị trí hiện tại..."
                  : "Đang tải bản đồ sân tập..."}
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center p-4">
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text className="text-red-500 text-center mt-4">{error}</Text>
              <TouchableOpacity
                className="mt-4 bg-primary px-6 py-3 rounded-xl"
                onPress={getCurrentLocationAndLoadStadiums}
                activeOpacity={0.7}
              >
                <Text className="text-white font-medium">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : filteredStadiums.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              <Ionicons name="location" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4">
                {searchText
                  ? "Không tìm thấy sân tập phù hợp"
                  : "Không có sân tập nào có vị trí"}
              </Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              provider="google"
              style={{ flex: 1 }}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
              userLocationPriority="high"
              userLocationUpdateInterval={5000}
            >
              {filteredStadiums.map(renderStadiumMarker)}
            </MapView>
          )}

          {/* Selected Stadium Info Card */}
          {renderSelectedStadiumInfo()}
        </View>
      </View>
    </Modal>
  );
};

export default StadiumPickerModal;
