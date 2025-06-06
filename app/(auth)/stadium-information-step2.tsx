import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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
  const [pricing, setPricing] = useState<string[]>([""]);

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
        {pricing.map((price, idx) => (
          <View key={idx} className="flex-row items-center mb-3">
            <TouchableOpacity
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 items-center justify-center"
              onPress={() => {
                // TODO: Implement image upload
              }}
            >
              <Ionicons name="image-outline" size={24} color="#515151" />
              <Text className="text-gray-400 mt-2 text-center">
                Tải lên hình ảnh bảng giá sân tập của bạn
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => setPricing([...pricing, ""])}
              className="ml-2"
            >
              <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
            </TouchableOpacity> */}
          </View>
        ))}
        {/* Progress Indicator */}
        {/* <View className="flex-row justify-center items-center my-4">
          <View className="w-3 h-3 rounded-full bg-gray-300 mx-1" />
          <View className="w-3 h-3 rounded-full bg-primary mx-1" />
          <View className="w-3 h-3 rounded-full bg-gray-300 mx-1" />
        </View> */}
        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton style={{width: "48%"}} title="Quay lại" filled={false} onPress={() => router.back()} />
          <AppButton style={{width: "48%"}} title="Tiếp tục" filled onPress={() => router.push('/(auth)/stadium-information-step3')} />
        </View>
      </ScrollView>
    </View>
  );
}