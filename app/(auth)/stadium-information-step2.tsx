import bankService, { Bank } from "@/services/bank";
import * as stadiumApi from "@/services/stadium";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import BankPickerModal from "../../components/BankPickerModal";
import SportNowHeader from "../../components/SportNowHeader";

export default function StadiumInformationStep2() {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pricePerHalfHour, setPricePerHalfHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const { stadiumId, step1Data } = useLocalSearchParams();

  useEffect(() => {
    fetchBanks();
    if (stadiumId) {
      fetchStadiumData();
    }
  }, [stadiumId]);

  // Fetch banks when banks are loaded and we have stadium data
  useEffect(() => {
    if (stadiumId && banks.length > 0) {
      fetchStadiumData();
    }
  }, [banks]);

  const fetchBanks = async () => {
    try {
      setBanksLoading(true);
      const banksData = await bankService.getPopularBanks();
      setBanks(banksData);
    } catch (error) {
      console.error("Error fetching banks:", error);
      // Fallback to empty array, user can still continue without bank selection
    } finally {
      setBanksLoading(false);
    }
  };

  const fetchStadiumData = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumStep2(
        parseInt(stadiumId as string)
      );
      // Find the bank object from the banks list if bank name exists
      if (data.bank && banks.length > 0) {
        const foundBank = banks.find(
          (b) =>
            b.shortName === data.bank ||
            b.name === data.bank ||
            b.code === data.bank
        );
        setSelectedBank(foundBank || null);
      }
      setAccountName(data.accountName);
      setAccountNumber(data.accountNumber);
      // Handle price data if available (cast to any for now since API types may not be updated)
      const dataWithPrice = data as any;
      if (dataWithPrice.pricePerHalfHour) {
        setPricePerHalfHour(
          formatVND(dataWithPrice.pricePerHalfHour.toString())
        );
      }
    } catch (err) {
      console.error("Error fetching stadium data:", err);
      alert("Không thể tải dữ liệu sân tập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Format VND currency
  const formatVND = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, "");

    // Add thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    const formatted = formatVND(value);
    setPricePerHalfHour(formatted);

    // Clear error when user starts typing
    if (errors.price) {
      const newErrors = { ...errors };
      delete newErrors.price;
      setErrors(newErrors);
    }
  };

  // Validate price input
  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    // Bank validation
    if (!selectedBank) {
      newErrors.bank = "Vui lòng chọn ngân hàng";
    }

    // Account name validation
    if (!accountName || accountName.trim() === "") {
      newErrors.accountName = "Vui lòng nhập tên tài khoản";
    }

    // Account number validation
    if (!accountNumber || accountNumber.trim() === "") {
      newErrors.accountNumber = "Vui lòng nhập số tài khoản";
    } else if (!/^\d{8,20}$/.test(accountNumber.replace(/\s/g, ""))) {
      newErrors.accountNumber = "Số tài khoản không hợp lệ (8-20 chữ số)";
    }

    // Price validation
    if (!pricePerHalfHour || pricePerHalfHour.trim() === "") {
      newErrors.price = "Vui lòng nhập giá thuê";
    } else {
      const priceNumber = parseInt(pricePerHalfHour.replace(/,/g, ""));
      if (isNaN(priceNumber) || priceNumber <= 0) {
        newErrors.price = "Giá thuê phải là số dương";
      } else if (priceNumber < 10000) {
        newErrors.price = "Giá thuê tối thiểu 10,000 VND";
      } else if (priceNumber > 10000000) {
        newErrors.price = "Giá thuê tối đa 10,000,000 VND";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    if (errors.bank) {
      const newErrors = { ...errors };
      delete newErrors.bank;
      setErrors(newErrors);
    }
  };

  const handleNext = async () => {
    try {
      if (!validateFields()) {
        const firstError = Object.values(errors)[0];
        alert(firstError);
        return;
      }

      // Convert price to number for step data
      const priceNumber = parseInt(pricePerHalfHour.replace(/,/g, ""));

      // Prepare step 2 data
      const step2Data = {
        bank: selectedBank?.shortName || "",
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        pricePerHalfHour: priceNumber, // Backend expects this field
      };

      // Combine step 1 and step 2 data
      let completeData;
      if (step1Data) {
        // New stadium creation - combine step 1 and step 2 data
        const step1ParsedData = JSON.parse(step1Data as string);
        completeData = {
          ...step1ParsedData,
          ...step2Data,
        };
      } else {
        // Editing existing stadium - only step 2 data for now
        completeData = step2Data;
      }

      console.log("Combined step 1 & 2 data:", completeData);

      // Navigate to step 3 with separated data
      router.push({
        pathname: "/(auth)/stadium-information-step3",
        params: {
          step1Data: step1Data,
          step2Data: JSON.stringify(step2Data),
          ...(stadiumId && { stadiumId }), // Include stadiumId if editing existing stadium
        },
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
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
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SportNowHeader title="Thông tin sân tập" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Vui lòng cập nhật thêm thông tin về sân tập của bạn.
        </Text>

        {/* Bank Info */}
        <Text className="font-InterBold mb-2">Thông tin tài khoản</Text>

        {/* Bank Selection with Modal */}
        <View className="mb-3">
          <TouchableOpacity
            className="border border-gray-300 rounded-xl px-4 py-3 flex-row items-center"
            onPress={() => setShowBankModal(true)}
          >
            {selectedBank ? (
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: selectedBank.logo }}
                  className="w-6 h-6 rounded mr-2"
                  resizeMode="contain"
                />
                <Text className="text-black flex-1">
                  {selectedBank.shortName}
                </Text>
              </View>
            ) : (
              <Text className="flex-1 text-gray-400">Chọn ngân hàng</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#515151" />
          </TouchableOpacity>
          {errors.bank && (
            <Text className="text-red-500 text-sm mt-1">{errors.bank}</Text>
          )}
        </View>

        {/* Account Name */}
        <View className="mb-3">
          <TextInput
            placeholder="Họ và tên"
            value={accountName}
            onChangeText={(text) => {
              setAccountName(text);
              if (errors.accountName) {
                const newErrors = { ...errors };
                delete newErrors.accountName;
                setErrors(newErrors);
              }
            }}
            className="border border-gray-300 rounded-xl px-4 py-3"
          />
          {errors.accountName && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.accountName}
            </Text>
          )}
        </View>

        {/* Account Number */}
        <View className="mb-3">
          <TextInput
            placeholder="Số tài khoản"
            value={accountNumber}
            onChangeText={(text) => {
              setAccountNumber(text);
              if (errors.accountNumber) {
                const newErrors = { ...errors };
                delete newErrors.accountNumber;
                setErrors(newErrors);
              }
            }}
            keyboardType="numeric"
            className="border border-gray-300 rounded-xl px-4 py-3"
          />
          {errors.accountNumber && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.accountNumber}
            </Text>
          )}
        </View>

        {/* Pricing */}
        <Text className="font-InterBold mb-2 mt-4">Giá thuê</Text>
        <View className="mb-3">
          <View className="border border-gray-300 rounded-xl px-4 py-3 flex-row items-center">
            <TextInput
              placeholder="Nhập giá thuê mỗi 30 phút"
              value={pricePerHalfHour}
              onChangeText={handlePriceChange}
              keyboardType="numeric"
              className="flex-1"
            />
            <Text className="text-gray-600 ml-2">VND</Text>
          </View>
          {errors.price && (
            <Text className="text-red-500 text-sm mt-1">{errors.price}</Text>
          )}
          <Text className="text-gray-500 text-sm mt-1">
            Ví dụ: 50,000 VND cho 30 phút
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8 mt-8">
          <AppButton
            style={{ width: "48%" }}
            title="Quay lại"
            filled={false}
            onPress={() => router.back()}
          />
          <AppButton
            style={{ width: "48%" }}
            title="Tiếp tục"
            filled
            onPress={handleNext}
          />
        </View>
      </ScrollView>

      {/* Bank Picker Modal */}
      <BankPickerModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectBank={handleSelectBank}
        banks={banks}
        loading={banksLoading}
        selectedBank={selectedBank}
      />
    </KeyboardAvoidingView>
  );
}
