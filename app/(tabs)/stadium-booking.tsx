import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserById, getUserIdFromStorage, saveUserToStorage, saveUserIdToStorage, clearUserData, User as ApiUser } from "../../services/user";
import {
  Animated,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StadiumCard from "../../components/StadiumCard";
import { getStadiumsByLocation, getStadiumsByName, getStadiumById, Stadium } from "../../services/stadium";
const { width } = Dimensions.get("window");
const CARD_WIDTH = 220;
const CARD_SPACING = 16;
const SNAP_TO = CARD_WIDTH + CARD_SPACING;
// Extended Stadium interface for the map component
interface StadiumWithLocation extends Stadium {
  address?: string;
  rating?: number;
  price?: number;
  area?: number;
  numberOfFields?: number;
  status?: string;
  images?: string[];
  userId?: number;
  user?: {
    id: number;
    email?: string;
  };
  createdAt?: string;
}

// Stadium data for map display
interface StadiumMapData {
  id: number;
  name: string;
  rating: number;
  distance: string;
  address: string;
  image: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export default function StadiumBooking() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [selectedStadium, setSelectedStadium] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [stadiums, setStadiums] = useState<StadiumMapData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [fullAddress, setFullAddress] = useState<string>(""); // Địa chỉ đầy đủ cho API
  const [userName, setUserName] = useState<string>("Hello");

  const { user } = useAuth();
  console.log("User info", user?.id);
  const userId = user?.id;
  const fetchUser = async () => {
    if (userId) {
      // Convert userId to number if needed
      const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      const userResult = await getUserById(userIdNumber);
      console.log("User info", userResult?.fullName);
      
      // Update userName state for UI
      if (userResult?.fullName) {
        setUserName(`Hello ${userResult.fullName}`);
      } else if (userResult?.email) {
        setUserName(`Hello ${userResult.email}`);
      } else {
        setUserName(`Hello User ${userResult?.id || ''}`);
      }
    } else {
      console.log("No user ID available");
      setUserName("Hello");
    }
  };
  useEffect(() => {
    requestLocationPermission();
    
    // Load user info
    const loadUser = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    
    loadUser();
  }, []);


  useEffect(() => {
    if (currentLocation && fullAddress) {
      fetchNearbyStadiums();
    }
  }, [currentLocation, fullAddress]);

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
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      
      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address && address.length > 0) {
        const addr = address[0];
        // Tạo địa chỉ ngắn gọn cho header và địa chỉ đầy đủ cho API
        const shortAddress = `${addr.district || ''} ${addr.city || addr.region || ''}`.trim();
        const fullAddressStr = `${addr.street || ''} ${addr.district || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
        
        setCurrentAddress(shortAddress || fullAddressStr || `${latitude}, ${longitude}`);
        setFullAddress(fullAddressStr || `${latitude}, ${longitude}`);
      }
      
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
      // Fallback to default location (Hanoi)
      setCurrentLocation({ latitude: 21.026745, longitude: 105.801982 });
      setCurrentAddress("Hà Nội, Việt Nam");
      setFullAddress("Hà Nội, Việt Nam");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyStadiums = async (address?: string, radius: number = 10) => {
    try {
      setLoading(true);
      const addressToSearch = address || fullAddress;
      if (!addressToSearch) return;

      console.log('Fetching stadiums near:', addressToSearch);
      const apiStadiums = await getStadiumsByLocation(addressToSearch, radius);
      
      transformAndSetStadiums(apiStadiums);
    } catch (error) {
      console.error('Error fetching nearby stadiums:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sân bóng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStadiumsByName = async (name: string) => {
    try {
      setLoading(true);
      console.log('Fetching stadiums by name:', name);
      const apiStadiums = await getStadiumsByName(name);
      
      transformAndSetStadiums(apiStadiums);
    } catch (error) {
      console.error('Error fetching stadiums by name:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm sân bóng');
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetStadiums = (apiStadiums: any[]) => {
    // Transform API data to component format
    const transformedStadiums: StadiumMapData[] = apiStadiums.map((stadium, index) => {
      const stadiumData = stadium as StadiumWithLocation; // Type casting for extended properties
      return {
        id: stadiumData.id,
        name: stadiumData.name,
        rating: stadiumData.rating ?? 4.0,
        distance: "Calculating...", // Will be calculated by API
        address: stadiumData.address ?? stadiumData.googleMap ?? "Địa chỉ không có",
        image: stadiumData.avatarUrl ?? (stadiumData.images && stadiumData.images[0]) ?? "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        coordinate: {
          // For now, use approximate coordinates around current location
          // In real app, you'd get coordinates from geocoding the stadium address
          latitude: (currentLocation?.latitude || 21.026745) + (Math.random() - 0.5) * 0.01,
          longitude: (currentLocation?.longitude || 105.801982) + (Math.random() - 0.5) * 0.01,
        }
      };
    });

    setStadiums(transformedStadiums);
    console.log(`Found ${transformedStadiums.length} stadiums`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchStadiumsByName(searchQuery.trim());
    } else {
      // If empty search, fetch nearby stadiums
      if (fullAddress) {
        fetchNearbyStadiums();
      }
    }
  };

  const handleMarkerPress = async (stadiumId: number) => {
    const stadium = stadiums.find(s => s.id === stadiumId);
    if (stadium) {
      console.log('\n🏟️ === STADIUM MARKER PRESSED ===');
      console.log('Stadium ID:', stadiumId);
      console.log('Stadium Name:', stadium.name);
      
      try {
        // Fetch full stadium details from API
        console.log('🔍 Fetching full stadium details from API...');
        const stadiumDetail = await getStadiumById(stadiumId);
        
        if (stadiumDetail) {
          console.log('✅ Stadium Detail Retrieved:');
          console.log('📋 BASIC INFO:');
          console.log('   - ID:', stadiumDetail.id);
          console.log('   - Name:', stadiumDetail.name);
          console.log('   - Phone:', stadiumDetail.phone || 'N/A');
          console.log('   - Email:', stadiumDetail.email || 'N/A');
          console.log('   - Website:', stadiumDetail.website || 'N/A');
          
          console.log('📍 LOCATION & ADDRESS:');
          console.log('   - Google Map:', stadiumDetail.googleMap || 'N/A');
          
          console.log('⏰ OPERATING HOURS:');
          console.log('   - Start Time:', stadiumDetail.startTime || 'N/A');
          console.log('   - End Time:', stadiumDetail.endTime || 'N/A');
          
          console.log('📄 DESCRIPTION:');
          console.log('   - Description:', stadiumDetail.description || 'N/A');
          console.log('   - Other Info:', stadiumDetail.otherInfo || 'N/A');
          
          console.log('⚽ SPORTS:');
          if (stadiumDetail.sports && stadiumDetail.sports.length > 0) {
            stadiumDetail.sports.forEach((sport, index) => {
              console.log(`   ${index + 1}. ${sport}`);
            });
          } else {
            console.log('   - No sports listed');
          }
          
          console.log('💳 PAYMENT INFO:');
          console.log('   - Bank:', stadiumDetail.bank || 'N/A');
          console.log('   - Account Name:', stadiumDetail.accountName || 'N/A');
          console.log('   - Account Number:', stadiumDetail.accountNumber || 'N/A');
          
          console.log('📞 CONTACT INFO:');
          if (stadiumDetail.otherContacts && stadiumDetail.otherContacts.length > 0) {
            stadiumDetail.otherContacts.forEach((contact, index) => {
              console.log(`   ${index + 1}. ${contact}`);
            });
          } else {
            console.log('   - No additional contacts');
          }
          
          console.log('💰 OTHER PAYMENTS:');
          if (stadiumDetail.otherPayments && stadiumDetail.otherPayments.length > 0) {
            stadiumDetail.otherPayments.forEach((payment, index) => {
              console.log(`   ${index + 1}. ${payment}`);
            });
          } else {
            console.log('   - No additional payment methods');
          }
          
          console.log('🖼️ MEDIA:');
          console.log('   - Avatar URL:', stadiumDetail.avatarUrl || 'N/A');
          console.log('   - Banner URL:', stadiumDetail.bannerUrl || 'N/A');
          console.log('   - Gallery URLs Count:', stadiumDetail.galleryUrls?.length || 0);
          console.log('   - Pricing Images Count:', stadiumDetail.pricingImages?.length || 0);
          
          console.log('🏟️ === END STADIUM DETAIL ===\n');
          
          // Navigate to detail page with full data
          router.push({
            pathname: "/stadium-booking/stadium-detail",
            params: { stadium: JSON.stringify(stadiumDetail) },
          });
        } else {
          console.log('❌ No stadium detail found');
        }
      } catch (error) {
        console.error('💥 Error fetching stadium detail:', error);
        console.log('Using basic stadium data for navigation');
        
        // Fallback to basic stadium data
        router.push({
          pathname: "/stadium-booking/stadium-detail",
          params: { stadium: JSON.stringify(stadium) },
        });
      }
    } else {
      console.log('❌ Stadium not found in local list');
    }
  };



  return (
    <View className="flex-1">
      {/* Header, Search, Filter - Top Layer */}
      <View style={{ zIndex: 2, backgroundColor: 'white' }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-8 pb-2">
          <View>
            <Text className="font-bold text-base text-[#222]">{userName}</Text>
            <Text className="text-xs text-[#888]" numberOfLines={1}>
              {currentAddress || "Đang xác định vị trí..."}
            </Text>
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
          </View>
        </View>
        {/* Search Bar */}
        <View className="flex-row items-center space-x-2 px-4 pb-2">
          <View className="flex-1 flex-row items-center bg-[#F2F2F2] rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Tìm kiếm theo tên sân..."
              className="flex-1 ml-2 text-base"
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator size="small" color="#7CB518" />}
          </View>
          <TouchableOpacity 
            onPress={handleSearch}
            className="bg-[#7CB518] rounded-full px-4 py-2"
          >
            <Text className="text-white font-medium">Tìm</Text>
          </TouchableOpacity>
        </View>
        {/* Filter/Sort */}
        <View className="flex-row items-center justify-between px-4 pb-2">
          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center bg-[#E6F4EA] rounded-lg px-3 py-1.5 mr-2">
              <Text className="text-[#7CB518] font-medium mr-1">
                {stadiums.length > 0 ? `${stadiums.length} sân` : 'Tất cả các sân'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#7CB518" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center ml-3">
              <Ionicons name="filter" size={20} color="#7CB518" />
              <Text className="text-[#7CB518] ml-1 font-medium">Sắp xếp</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#7CB518" />
              <Text className="text-[#7CB518] ml-2 text-sm">Đang tìm...</Text>
            </View>
          )}
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
