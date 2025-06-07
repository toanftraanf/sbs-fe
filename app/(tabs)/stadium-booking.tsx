import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import StadiumCard from "../../components/StadiumCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 220;
const CARD_SPACING = 16;
const SNAP_TO = CARD_WIDTH + CARD_SPACING;

// Stadium data with coordinates
const stadiums = [
  {
    id: 1,
    name: "Sân ABC",
    rating: 4.8,
    distance: "2.6 km",
    address: "Số 12, Đường A3, P. Long...",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    coordinate: {
      latitude: 21.026745,
      longitude: 105.801982,
    }
  },
  {
    id: 2,
    name: "Sân XYZ",
    rating: 5,
    distance: "2.6 km",
    address: "Số 12, Đường A3, P. Long...",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    coordinate: {
      latitude: 21.027745,
      longitude: 105.802982,
    }
  },
  {
    id: 3,
    name: "Sân DEF",
    rating: 3,
    distance: "2.7 km",
    address: "Số 12, Đường A3, P. Long...",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    coordinate: {
      latitude: 21.025745,
      longitude: 105.800982,
    }
  },
];

export default function StadiumBooking() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [selectedStadium, setSelectedStadium] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Quyền truy cập vị trí',
          'Ứng dụng cần quyền truy cập vị trí để hiển thị sân bóng gần bạn',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Cho phép', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      
      // Center map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    }
  };

  const handleMarkerPress = (stadiumId: number) => {
    const stadium = stadiums.find(s => s.id === stadiumId);
    if (stadium) {
      console.log('Marker pressed:', stadium.name);
      router.push({
        pathname: "/stadium-booking/stadium-detail",
        params: { stadium: JSON.stringify(stadium) },
      });
    }
  };

  return (
    <View className="flex-1">
      {/* Header, Search, Filter - Top Layer */}
      <View style={{ zIndex: 2, backgroundColor: 'white' }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-8 pb-2">
          <View>
            <Text className="font-bold text-base text-[#222]">Nguyễn Văn A</Text>
            <Text className="text-xs text-[#888]">Quận 9, TP. HCM</Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={getCurrentLocation}
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F2F2F2]"
            >
              <Ionicons name="location" size={24} color="#7CB518" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log("Notification pressed")}
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F2F2F2]"
            >
              <Ionicons name="notifications-outline" size={24} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log("Profile pressed")}
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F2F2F2]"
            >
              <Ionicons name="person-circle-outline" size={24} color="#7CB518" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Search Bar */}
        <View className="flex-row items-center space-x-2 px-4 pb-2">
          <View className="flex-1 flex-row items-center bg-[#F2F2F2] rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="...Tìm kiếm"
              className="flex-1 ml-2 text-base"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>
        {/* Filter/Sort */}
        <View className="flex-row items-center px-4 pb-2">
          <TouchableOpacity className="flex-row items-center bg-[#E6F4EA] rounded-lg px-3 py-1.5 mr-2">
            <Text className="text-[#7CB518] font-medium mr-1">Tất cả các sân</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#7CB518" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center ml-3">
            <Ionicons name="filter" size={20} color="#7CB518" />
            <Text className="text-[#7CB518] ml-1 font-medium">Sắp xếp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map - Middle Layer */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1, zIndex: 1 }}
        initialRegion={{
          latitude: 21.026745,
          longitude: 105.801982,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        customMapStyle={[
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{"saturation": 36}, {"color": "#333333"}, {"lightness": 40}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"lightness": 16}]
          }
        ]}
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Vị trí của bạn"
            description="Vị trí hiện tại"
          >
            <View style={{
              width: 20,
              height: 20,
              backgroundColor: '#4285F4',
              borderRadius: 10,
              borderWidth: 3,
              borderColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
              elevation: 3,
            }} />
          </Marker>
        )}

        {/* Stadium markers */}
        {stadiums.map((stadium) => (
          <Marker
            key={stadium.id}
            coordinate={stadium.coordinate}
            onPress={() => handleMarkerPress(stadium.id)}
          >
            <View style={{ alignItems: 'center' }}>
              {/* Stadium name above marker */}
              <View style={{
                backgroundColor: 'white',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                marginBottom: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 3,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#7CB518',
                  textAlign: 'center'
                }}>
                  {stadium.name}
                </Text>
              </View>
              
              {/* Marker pin */}
              <View style={{
                width: 30,
                height: 30,
                backgroundColor: '#7CB518',
                borderRadius: 15,
                borderWidth: 3,
                borderColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 3,
              }}>
                <Ionicons name="football" size={16} color="white" />
              </View>
            </View>
            
            <Callout>
              <View style={{ minWidth: 150, padding: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222' }}>
                  {stadium.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {stadium.address}
                </Text>
                <Text style={{ fontSize: 12, color: '#7CB518', marginTop: 4 }}>
                  ⭐ {stadium.rating} • {stadium.distance}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Stadium Cards - Above Tab Bar */}
      <View
        className="absolute left-0 right-0"
        style={{ bottom: 100, height: 215, zIndex: 3 }}
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
  );
}
