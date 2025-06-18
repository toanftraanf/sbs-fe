import env from "@/config/env";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface MapLocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
}) => {
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      latitude: 10.852909,
      longitude: 106.789989, // Default to Hanoi
      address: "",
    }
  );
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  const GOONG_API_KEY =
    env.GOONG_API_KEY || "wnicbAmnNkoaPYzlDmMapdMKRwaRu8P2MBckZVEm";

  console.log(
    "🗺️ MapLocationPicker - API Key:",
    GOONG_API_KEY ? "✅ Present" : "❌ Missing"
  );

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setSearchText(initialLocation.address);
    } else {
      // If no initial location, fetch address for default Hanoi coordinates
      fetchAddressForInitialLocation();
    }
    console.log("🗺️ MapLocationPicker - Initial location:", initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  const fetchAddressForInitialLocation = async () => {
    const address = await reverseGeocode(10.852909, 106.789989);
    setSelectedLocation((prev) => ({
      ...prev,
      address: address,
    }));
    setSearchText(address);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationPermission(true);
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const searchLocation = async () => {
    if (!searchText.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
          searchText
        )}&api_key=${GOONG_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLocation = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
        };
        setSelectedLocation(newLocation);

        // Animate map to the new location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: newLocation.latitude,
              longitude: newLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            1000
          );
        }
      } else {
        Alert.alert("Không tìm thấy", "Không tìm thấy địa điểm này");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Lỗi", "Không thể tìm kiếm địa điểm");
    } finally {
      setIsSearching(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    // If no valid API key, try Expo Location first, then use coordinates as fallback
    if (
      !GOONG_API_KEY ||
      GOONG_API_KEY === "wnicbAmnNkoaPYzlDmMapdMKRwaRu8P2MBckZVEm"
    ) {
      try {
        console.log(
          `🗺️ Using Expo Location for reverse geocoding: ${lat}, ${lng}`
        );
        const result = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        if (result && result.length > 0) {
          const addr = result[0];
          const address = `${addr.street || ""} ${addr.district || ""} ${
            addr.city || ""
          } ${addr.region || ""}`.trim();
          console.log("🗺️ Expo Location address:", address);
          return address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      } catch (error) {
        console.log("🗺️ Expo Location failed, falling back to coordinates");
      }

      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    // Use Goong API if valid key is available
    try {
      console.log(`🗺️ Using Goong API for reverse geocoding: ${lat}, ${lng}`);
      const response = await fetch(
        `https://rsapi.goong.io/geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("🗺️ Goong API response:", data);

      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        console.log("🗺️ Found address:", address);
        return address;
      }

      console.log("🗺️ No results found, using coordinates");
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("🗺️ Goong API error:", error);
      // Fallback to Expo Location
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (result && result.length > 0) {
          const addr = result[0];
          const address = `${addr.street || ""} ${addr.district || ""} ${
            addr.city || ""
          } ${addr.region || ""}`.trim();
          return address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      } catch (expoError) {
        console.error("🗺️ Expo Location also failed:", expoError);
      }

      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("🗺️ Map pressed at:", latitude, longitude);

    const address = await reverseGeocode(latitude, longitude);

    const newLocation = {
      latitude,
      longitude,
      address,
    };

    setSelectedLocation(newLocation);
    setSearchText(address);
  };

  const handleMarkerDragEnd = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("🗺️ Marker dragged to:", latitude, longitude);

    const address = await reverseGeocode(latitude, longitude);

    const newLocation = {
      latitude,
      longitude,
      address,
    };

    setSelectedLocation(newLocation);
    setSearchText(address);
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
    onClose();
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;

      const address = await reverseGeocode(latitude, longitude);

      const newLocation = {
        latitude,
        longitude,
        address,
      };

      setSelectedLocation(newLocation);
      setSearchText(address);

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          1000
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Chọn vị trí</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text className="text-primary font-semibold">Xác nhận</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Tìm kiếm địa điểm..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={searchLocation}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            onPress={searchLocation}
            disabled={isSearching}
            className="ml-2 bg-primary rounded-lg px-4 py-2"
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">Tìm</Text>
            )}
          </TouchableOpacity>
          {locationPermission && (
            <TouchableOpacity
              onPress={getCurrentLocation}
              className="ml-2 bg-blue-500 rounded-lg p-2"
            >
              <Ionicons name="locate" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Selected location info */}
        <View className="p-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-sm text-gray-600 mb-1">Địa điểm đã chọn:</Text>
          <Text className="text-base font-medium text-gray-800">
            {selectedLocation.address || "Chưa chọn địa điểm"}
          </Text>
        </View>

        {/* Map */}
        <View className="flex-1">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={locationPermission}
            showsMyLocationButton={false}
            onPress={handleMapPress}
          >
            {/* Selected location marker */}
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: "#7CB518",
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
                <Ionicons name="location" size={16} color="white" />
              </View>
            </Marker>
          </MapView>
        </View>

        {/* Instructions */}
        <View className="p-4 bg-yellow-50 border-t border-yellow-200">
          <Text className="text-xs text-yellow-800 text-center">
            Nhấn vào bản đồ hoặc kéo thả marker để chọn vị trí chính xác
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default MapLocationPicker;
