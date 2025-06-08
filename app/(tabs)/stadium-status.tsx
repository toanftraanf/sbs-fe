import { useAuth } from "@/contexts/AuthContext";
import { ADD_STADIUM, GET_OWNER_STADIUMS } from "@/graphql";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SportNowHeader from "../../components/SportNowHeader";

export default function StadiumStatus() {
  const { user } = useAuth();
  const ownerId = Number(user?.id);
  const [stadiumName, setStadiumName] = useState("");
  const [stadiumLocation, setStadiumLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const { data, loading, refetch } = useQuery(GET_OWNER_STADIUMS, {
    variables: { ownerId },
    skip: !ownerId,
    fetchPolicy: "network-only",
  });

  const [addStadium, { loading: adding }] = useMutation(ADD_STADIUM, {
    onCompleted: () => {
      setStadiumName("");
      setStadiumLocation("");
      setModalVisible(false);
      refetch();
      Alert.alert("Thành công", "Đã thêm sân mới!");
    },
    onError: (error) => {
      Alert.alert("Lỗi", error.message);
    },
  });

  const handleAddStadium = () => {
    if (!stadiumName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên sân");
      return;
    }
    addStadium({
      variables: {
        input: {
          name: stadiumName,
          location: stadiumLocation,
          ownerId,
        },
      },
    });
  };

  const renderStadiumItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
      onPress={() => {
        console.log("Navigating to stadium detail with ID:", item.id);
        router.push(`/(auth)/stadium-information-step1?stadiumId=${item.id}`);
      }}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="font-InterBold text-lg text-gray-800">
            {item.name}
          </Text>
          <Text className="text-gray-500 mt-1">
            {item.location || "Chưa có địa chỉ"}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
            <Text className="text-green-600 text-sm font-InterSemiBold">
              Hoạt động
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <SportNowHeader title="Quản lý sân" />
        <View className="flex-1 justify-center items-center">
          <Text>Đang tải...</Text>
        </View>
      </View>
    );
  }

  const stadiums = data?.sports || [];

  return (
    <View className="flex-1 bg-gray-50">
      <SportNowHeader title="Quản lý sân" />

      <View className="flex-1 px-4 pt-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-InterBold text-gray-800">
            Sân của tôi
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.headerAddBtn}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {stadiums.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="business-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">Chưa có sân nào</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Thêm sân đầu tiên để bắt đầu quản lý dịch vụ của bạn
            </Text>
          </View>
        ) : (
          <FlatList
            data={stadiums}
            renderItem={renderStadiumItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text className="text-xl font-InterBold mb-4">Thêm sân mới</Text>

            <TextInput
              style={styles.input}
              placeholder="Tên sân"
              value={stadiumName}
              onChangeText={setStadiumName}
            />

            <TextInput
              style={styles.input}
              placeholder="Địa chỉ (không bắt buộc)"
              value={stadiumLocation}
              onChangeText={setStadiumLocation}
            />

            <View className="flex-row mt-4">
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#f3f4f6" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text className="font-InterSemiBold text-gray-600">Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#5A983B" }]}
                onPress={handleAddStadium}
                disabled={adding}
              >
                <Text className="font-InterSemiBold text-white">
                  {adding ? "Đang thêm..." : "Thêm sân"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerAddBtn: {
    backgroundColor: "#5A983B",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
});
