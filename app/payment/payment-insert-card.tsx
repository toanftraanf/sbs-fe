import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import BankPickerModal from "@/components/BankPickerModal";
import Checkbox from "@/components/Checkbox";
import ScreenHeader from "@/components/ScreenHeader";
import { useBanks } from "@/hooks/useBanks";
import usePaymentInsertCard from "@/hooks/usePaymentInsertCard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentInsertCard() {
  const { banks, loading: banksLoading } = useBanks();
  const [show_bank_picker, set_show_bank_picker] = useState(false);
  const {
    form_data,
    selected_bank,
    save_card,
    errors,
    loading,
    handle_input_change,
    handle_bank_selection,
    handle_submit,
    set_save_card,
    format_card_number,
    format_expiry,
  } = usePaymentInsertCard();

  return (
    <LinearGradient
      colors={["#fff", "#E5E5E5"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <ScreenHeader title="Thêm Thẻ" />

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 0 }}>
            {/* Card Form Section */}
            <View className="bg-white rounded-2xl shadow-md p-0 overflow-hidden mb-6">
              {/* Section Title */}
              <View className="flex-row items-center px-4 py-3 border-b border-[#E0E0E0] bg-[#F8F8F8]">
                <Ionicons name="card-outline" size={20} color="#757575" />
                <Text className="ml-2 text-base font-semibold text-[#444] flex-1">
                  Thẻ Tín dụng/Ghi nợ
                </Text>
              </View>
              {/* Form Fields */}
              <View className="px-4 py-4">
                {/* Cardholder Name */}
                <Text className="text-sm font-medium text-[#666] mb-2">
                  Tên Chủ Thẻ
                </Text>
                <AppTextInput
                  placeholder="Nguyễn Văn A"
                  value={form_data.cardholder_name}
                  onChangeText={(text) =>
                    handle_input_change("cardholder_name", text)
                  }
                />
                {errors.cardholder_name && (
                  <Text className="text-red-500 text-xs mb-2">
                    {errors.cardholder_name}
                  </Text>
                )}
                {/* Bank Selection */}
                <Text className="text-sm font-medium text-[#666] mb-2 pt-5">
                  Ngân Hàng
                </Text>
                <TouchableOpacity
                  onPress={() => set_show_bank_picker(true)}
                  className="flex-row items-center justify-between bg-white border border-[#E0E0E0] rounded-lg px-3 py-3 mb-2"
                >
                  <View className="flex-1">
                    {selected_bank ? (
                      <View className="flex-row items-center">
                        {selected_bank.logo && (
                          <Image
                            source={{ uri: selected_bank.logo }}
                            className="w-6 h-6 mr-2"
                          />
                        )}
                        <Text className="text-[#444] font-medium">
                          {selected_bank.name}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-[#999]">Chọn ngân hàng</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#757575" />
                </TouchableOpacity>
                {errors.bank_name && (
                  <Text className="text-red-500 text-xs mb-2">
                    {errors.bank_name}
                  </Text>
                )}
                {/* Card Number */}
                <Text className="text-sm font-medium text-[#666] mb-2 pt-5">
                  Số Thẻ
                </Text>
                <AppTextInput
                  placeholder="1234 5678 1234 5678"
                  value={form_data.card_number}
                  onChangeText={(text) =>
                    handle_input_change("card_number", format_card_number(text))
                  }
                  keyboardType="numeric"
                  maxLength={19}
                />
                {errors.card_number && (
                  <Text className="text-red-500 text-xs mb-2">
                    {errors.card_number}
                  </Text>
                )}
                {/* Expiry & CVV Row */}
                <View className="flex-row mb-2 pt-5">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-medium text-[#666] mb-2">
                      Ngày hết hạn
                    </Text>
                    <AppTextInput
                      placeholder="MM/YYYY"
                      value={form_data.expiry}
                      onChangeText={(text) =>
                        handle_input_change("expiry", format_expiry(text))
                      }
                      keyboardType="numeric"
                      maxLength={7}
                    />
                    {errors.expiry && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.expiry}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-[#666] mb-2">
                      CVV
                    </Text>
                    <AppTextInput
                      placeholder="***"
                      value={form_data.cvv}
                      onChangeText={(text) =>
                        handle_input_change("cvv", text.replace(/[^\d]/g, ""))
                      }
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                    {errors.cvv && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.cvv}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
            {/* Save Card Checkbox */}
            <Checkbox
              label="Lưu thẻ cho lần thanh toán sau."
              checked={save_card}
              onToggle={(checked) => set_save_card(checked)}
              className="mb-8 ml-1"
            />
          </ScrollView>

          {/* Save Button - Sticky Bottom */}
          <View className="px-4 pb-6 pt-4 bg-transparent">
            <AppButton
              title={loading ? "Đang lưu..." : "Lưu Thẻ"}
              onPress={handle_submit}
              disabled={loading}
            />
          </View>
        </View>

        {/* Bank Picker Modal */}
        <BankPickerModal
          visible={show_bank_picker}
          banks={banks}
          loading={banksLoading}
          onSelectBank={handle_bank_selection}
          onClose={() => set_show_bank_picker(false)}
          selectedBank={selected_bank}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
