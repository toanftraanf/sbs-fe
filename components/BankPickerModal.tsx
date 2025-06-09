import { Bank } from "@/services/bank";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface BankPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: (bank: Bank) => void;
  banks: Bank[];
  loading?: boolean;
  selectedBank?: Bank | null;
}

export default function BankPickerModal({
  visible,
  onClose,
  onSelectBank,
  banks,
  loading = false,
  selectedBank,
}: BankPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: Bank) => {
    onSelectBank(bank);
    setSearchQuery("");
    onClose();
  };

  const renderBankItem = ({ item }: { item: Bank }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      onPress={() => handleSelectBank(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.logo }}
        className="w-10 h-10 rounded-lg mr-3"
        resizeMode="contain"
      />
      <View className="flex-1">
        <Text className="font-InterSemiBold text-base text-gray-900">
          {item.shortName}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      {selectedBank?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#7CB518" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Text className="text-lg font-InterBold">Chọn ngân hàng</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Tìm kiếm ngân hàng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-base"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Banks List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#7CB518" />
            <Text className="text-gray-600 mt-2">
              Đang tải danh sách ngân hàng...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBanks}
            renderItem={renderBankItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-8">
                <Ionicons name="search" size={48} color="#ccc" />
                <Text className="text-gray-500 mt-2">
                  Không tìm thấy ngân hàng nào
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}
