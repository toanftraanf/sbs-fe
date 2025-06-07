import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as stadiumApi from "@/services/stadium";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import AppButton from "../../components/AppButton";
import SportNowHeader from "../../components/SportNowHeader";

const TABS = [
  { key: "avatar", label: "Ảnh đại diện", icon: "person-circle" },
  { key: "banner", label: "Ảnh banner", icon: "image" },
  { key: "stadium", label: "Ảnh sân tập", icon: "images" },
];

export default function StadiumInformationStep3() {
  const [activeTab, setActiveTab] = useState("avatar");
  const router = useRouter();
  const { stadiumId } = useLocalSearchParams();
  const [avatarUri, setAvatarUri] = useState("");
  const [bannerUri, setBannerUri] = useState("");
  const [galleryUris, setGalleryUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stadiumId) {
      fetchStadiumData();
    }
  }, [stadiumId]);

  const fetchStadiumData = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumStep3(parseInt(stadiumId as string));
      setAvatarUri(data.avatarUrl);
      setBannerUri(data.bannerUrl);
      setGalleryUris(data.galleryUrls);
    } catch (err) {
      console.error('Error fetching stadium data:', err);
      alert('Không thể tải dữ liệu sân tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh!');
      }
    })();
  }, []);

  // Hàm chọn 1 ảnh (avatar/banner)
  const pickSingleImage = async (onPick: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    console.log('Kết quả chọn ảnh (single):', result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log('Đã chọn uri:', result.assets[0].uri);
      onPick(result.assets[0].uri);
    }
  };

  // Hàm chọn nhiều ảnh (gallery)
  const pickMultipleImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    console.log('Kết quả chọn ảnh (multiple):', result);
    if (!result.canceled && result.assets) {
      console.log('Các uri đã chọn:', result.assets.map(a => a.uri));
      setGalleryUris([...galleryUris, ...result.assets.map(a => a.uri)]);
    }
  };

  const handleFinish = async () => {
    try {
      if (!stadiumId) {
        console.error('stadiumId is missing');
        return;
      }
      console.log('stadiumId:', stadiumId);
      const input = {
        id: parseInt(stadiumId as string),
        avatarUrl: avatarUri,
        bannerUrl: bannerUri,
        galleryUrls: galleryUris,
      };
      console.log('Input truyền vào updateStadiumStep3:', input);
      const result = await stadiumApi.updateStadiumStep3(input);
      console.log('Result from step 3:', result);
      router.replace("/stadium-status"); 
    } catch (err) {
      console.error('Error in handleFinish:', err);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SportNowHeader title="Thông tin sân tập" />
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Vui lòng cập nhật thêm thông tin về sân tập của bạn.
        </Text>
        {/* Tabs */}
        <View className="flex-row mb-4">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 items-center pb-2 border-b-2 ${
                activeTab === tab.key ? "border-primary" : "border-gray-200"
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={activeTab === tab.key ? "#4CAF50" : "#B0B0B0"}
              />
              <Text
                className={`mt-1 font-InterBold ${
                  activeTab === tab.key ? "text-primary" : "text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Avatar */}
        {activeTab === "avatar" && (
          <TouchableOpacity onPress={() => pickSingleImage(setAvatarUri)} style={{ alignItems: 'center', marginBottom: 24 }}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 120, height: 120, borderRadius: 60 }} />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                <Text>Chọn ảnh đại diện</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {/* Banner */}
        {activeTab === "banner" && (
          <TouchableOpacity onPress={() => pickSingleImage(setBannerUri)} style={{ alignItems: 'center', marginBottom: 24 }}>
            {bannerUri ? (
              <Image source={{ uri: bannerUri }} style={{ width: '100%', height: 120, borderRadius: 12 }} />
            ) : (
              <View style={{ width: '100%', height: 120, borderRadius: 12, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                <Text>Chọn ảnh banner</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {/* Gallery */}
        {activeTab === "stadium" && (
          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity onPress={pickMultipleImages} style={{ marginBottom: 12 }}>
              <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>+ Thêm ảnh sân tập</Text>
            </TouchableOpacity>
            <ScrollView horizontal>
              {galleryUris.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }} />
              ))}
            </ScrollView>
          </View>
        )}
        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton style={{ width: "48%" }} title="Quay lại" filled={false} onPress={() => router.back()} />
          <AppButton style={{ width: "48%" }} title="Hoàn thành" filled onPress={handleFinish} />
        </View>
      </ScrollView>
    </View>
  );
}