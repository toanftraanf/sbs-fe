import { useAuth } from "@/contexts/AuthContext";
import { getStadiumsByLocation, getStadiumsByName } from "@/services/stadium";
import { getUserById } from "@/services/user";
import { StadiumMapData } from "@/types/stadium";
import {
  getCurrentLocationWithLoading,
  LocationResult,
  requestLocationPermission
} from "@/utils";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import MapView from "react-native-maps";

export default function useStadiumBooking() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [selectedStadium, setSelectedStadium] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [stadiums, setStadiums] = useState<StadiumMapData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [fullAddress, setFullAddress] = useState<string>("");
  const [userName, setUserName] = useState<string>("Hello");

  const { user } = useAuth();

  const fetchUser = async () => {
    if (user?.id) {
      const userIdNumber = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
      const userResult = await getUserById(userIdNumber);

      if (userResult?.fullName) {
        setUserName(`Hello ${userResult.fullName}`);
      } else if (userResult?.email) {
        setUserName(`Hello ${userResult.email}`);
      } else {
        setUserName(`Hello User ${userResult?.id || ""}`);
      }
    } else {
      setUserName("Hello");
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      const permission = await requestLocationPermission();
      if (permission.granted) {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          "Quyền truy cập vị trí",
          "Ứng dụng cần quyền truy cập vị trí để hiển thị sân bóng gần bạn"
        );
      }
    };
    
    initializeLocation();
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentLocation && fullAddress) {
      fetchNearbyStadiums();
    }
  }, [currentLocation, fullAddress]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const location = await getCurrentLocationWithLoading('short', {
        onStart: () => setLoading(true),
        onComplete: (result: LocationResult | null) => {
          if (result) {
            setCurrentLocation({ 
              latitude: result.latitude, 
              longitude: result.longitude 
            });
            setCurrentAddress(result.address);
            
            // Also get full address format for fullAddress state
            getCurrentLocationWithLoading('full').then(fullResult => {
              if (fullResult) {
                setFullAddress(fullResult.address);
              }
            });
          } else {
            // Fallback to default location
            setCurrentLocation({ latitude: 21.026745, longitude: 105.801982 });
            setCurrentAddress("Thủ đức, Tp Hồ Chí Minh, Việt Nam");
            setFullAddress("Thủ đức, Tp Hồ Chí Minh, Việt Nam");
          }
        },
        onError: (error: any) => {
          console.error("Error getting current location:", error);
          Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
          // Fallback to default location
          setCurrentLocation({ latitude: 21.026745, longitude: 105.801982 });
          setCurrentAddress("Thủ đức, Tp Hồ Chí Minh, Việt Nam");
          setFullAddress("Thủ đức, Tp Hồ Chí Minh, Việt Nam");
        },
      });

      // Animate map to location
      if (location && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          1000
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyStadiums = async (address?: string, radius: number = 10) => {
    try {
      setLoading(true);
      const addressToSearch = address || fullAddress;
      if (!addressToSearch) return;

      let apiStadiums = await getStadiumsByLocation(addressToSearch, radius);

      if (!apiStadiums || apiStadiums.length === 0) {
        const parts = addressToSearch.split(" ");
        const broaderSearchTerms = [
          "Hồ Chí Minh",
          "Thủ Đức Hồ chí Minh",
          parts.slice(-2).join(" "),
        ];

        for (const searchTerm of broaderSearchTerms) {
          try {
            apiStadiums = await getStadiumsByLocation(searchTerm, radius * 2);
            if (apiStadiums && apiStadiums.length > 0) break;
          } catch (searchError) {
            console.error("Error in broader search:", searchError);
          }
        }
      }

      if (apiStadiums && apiStadiums.length > 0) {
        transformAndSetStadiums(apiStadiums);
      }
    } catch (error) {
      console.error("Error fetching nearby stadiums:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sân");
    } finally {
      setLoading(false);
    }
  };

  const fetchStadiumsByName = async (name: string) => {
    try {
      setLoading(true);
      const apiStadiums = await getStadiumsByName(name);
      if (apiStadiums && apiStadiums.length > 0) {
        transformAndSetStadiums(apiStadiums);
      }
    } catch (error) {
      console.error("Error fetching stadiums by name:", error);
      Alert.alert("Lỗi", "Không thể tìm kiếm sân");
    } finally {
      setLoading(false);
    }
  };

  const transformAndSetStadiums = (apiStadiums: any[]) => {
    const transformedStadiums = apiStadiums.map((stadium: any) => ({
      id: stadium.id,
      name: stadium.name,
      rating: stadium.rating ?? 4.0,
      address: stadium.address ?? stadium.googleMap ?? "Địa chỉ không có",
      image: stadium.avatarUrl ?? 
        (stadium.images && stadium.images[0]) ?? 
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      coordinate: {
        latitude: parseFloat(stadium.latitude),
        longitude: parseFloat(stadium.longitude),
      },
    }));
    setStadiums(transformedStadiums);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchStadiumsByName(searchQuery.trim());
    } else {
      fetchNearbyStadiums();
    }
  };

  const handleMarkerPress = async (stadiumId: number) => {
    setSelectedStadium(stadiumId);
    const index = stadiums.findIndex((s) => s.id === stadiumId);
    if (index !== -1) {
      const stadium = stadiums[index];
      mapRef.current?.animateToRegion(
        {
          latitude: stadium.coordinate.latitude,
          longitude: stadium.coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350
      );
    }
  };

  return {
    scrollX,
    mapRef,
    selectedStadium,
    currentLocation,
    locationPermission,
    stadiums,
    loading,
    searchQuery,
    setSearchQuery,
    currentAddress,
    userName,
    handleSearch,
    handleMarkerPress,
    getCurrentLocation,
  };
} 