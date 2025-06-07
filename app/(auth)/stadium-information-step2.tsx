import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as stadiumApi from "@/services/stadium";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
} from "react-native";
import AppButton from "../../components/AppButton";
import SportNowHeader from "../../components/SportNowHeader";

const BANKS = [
  "Vietcombank",
  "Techcombank",
  "BIDV",
  "VietinBank",
  "MB Bank",
  "ACB",
  "Sacombank",
  "TPBank",
  // ...add more as needed
];

export default function StadiumInformationStep2() {
  const [bank, setBank] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [otherPayments, setOtherPayments] = useState<string[]>([""]);
  const [pricingImages, setPricingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { stadiumId } = useLocalSearchParams();

  useEffect(() => {
    if (stadiumId) {
      fetchStadiumData();
    }
  }, [stadiumId]);

  const fetchStadiumData = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumStep2(parseInt(stadiumId as string));
      setBank(data.bank);
      setAccountName(data.accountName);
      setAccountNumber(data.accountNumber);
      setOtherPayments(data.otherPayments.length > 0 ? data.otherPayments : [""]);
      setPricingImages(data.pricingImages);
    } catch (err) {
      console.error('Error fetching stadium data:', err);
      alert('Không thể tải dữ liệu sân tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm chọn ảnh bảng giá
  const pickPricingImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    console.log('Kết quả chọn ảnh bảng giá:', result);
    if (!result.canceled && result.assets) {
      console.log('Các uri bảng giá đã chọn:', result.assets.map(a => a.uri));
      setPricingImages([...pricingImages, ...result.assets.map(a => a.uri)]);
    }
  };

  const handleNext = async () => {
    try {
      const result = await stadiumApi.updateStadiumStep2({
        id: parseInt(stadiumId as string),
        bank,
        accountName,
        accountNumber,
        otherPayments,
        pricingImages,
      });
      console.log('Result from step 2:', result);
      router.push({
        pathname: "/(auth)/stadium-information-step3",
        params: { stadiumId: stadiumId },
      });
    } catch (err) {
      console.error(err);
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
        {/* Bank Info */}
        <Text className="font-InterBold mb-2">Thông tin tài khoản</Text>
        {/* Bank Dropdown */}
        <TouchableOpacity
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 flex-row items-center"
          onPress={() => setShowBankDropdown(!showBankDropdown)}
        >
          <Text className={`flex-1 ${bank ? 'text-black' : 'text-gray-400'}`}>{bank || "Chọn ngân hàng"}</Text>
          <Ionicons name="chevron-down" size={20} color="#515151" />
        </TouchableOpacity>
        {showBankDropdown && (
          <View className="border border-gray-300 rounded-xl mb-3 bg-white max-h-40">
            {BANKS.map((b) => (
              <TouchableOpacity key={b} className="px-4 py-3" onPress={() => { setBank(b); setShowBankDropdown(false); }}>
                <Text className="text-black">{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* Account Name */}
        <TextInput
          placeholder="Họ và tên"
          value={accountName}
          onChangeText={setAccountName}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Account Number */}
        <TextInput
          placeholder="Số tài khoản"
          value={accountNumber}
          onChangeText={setAccountNumber}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Other Payments */}
        {otherPayments.map((pay, idx) => (
          <View key={idx} className="flex-row items-center mb-3">
            <TextInput
              placeholder="Thêm thông tin thanh toán khác"
              value={pay}
              onChangeText={(text) => {
                const arr = [...otherPayments];
                arr[idx] = text;
                setOtherPayments(arr);
              }}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            />
            <TouchableOpacity
              onPress={() => setOtherPayments([...otherPayments, ""])}
              className="ml-2"
            >
              <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        ))}
        {/* Pricing */}
        <Text className="font-InterBold mb-2 mt-4">Bảng giá</Text>
        <TouchableOpacity
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 items-center justify-center mb-3"
          onPress={pickPricingImage}
        >
          <Ionicons name="image-outline" size={24} color="#515151" />
          <Text className="text-gray-400 mt-2 text-center">
            Tải lên hình ảnh bảng giá sân tập của bạn
          </Text>
        </TouchableOpacity>
        <ScrollView horizontal style={{ marginBottom: 12 }}>
          {pricingImages.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }} />
          ))}
        </ScrollView>
        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton style={{width: "48%"}} title="Quay lại" filled={false} onPress={() => router.back()} />
          <AppButton style={{width: "48%"}} title="Tiếp tục" filled onPress={handleNext} />
        </View>
      </ScrollView>
    </View>
  );
}