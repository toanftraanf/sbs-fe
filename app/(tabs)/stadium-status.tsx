import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import SportNowHeader from "../../components/SportNowHeader";
import { router } from "expo-router";

const GET_OWNER_STADIUMS = gql`
  query GetStadiumsByUser($ownerId: Int!) {
    sports(ownerId: $ownerId) {
      id
      name
      location
    }
  }
`;

const ADD_STADIUM = gql`
  mutation AddStadium($input: CreateStadiumInput!) {
    createStadium(createStadiumInput: $input) {
      id
      name
      location
    }
  }
`;

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <SportNowHeader title="Trạng thái sân" showBack />
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>Danh sách sân tập của bạn</Text>
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => router.push('/(auth)/stadium-information-step1')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text>Đang tải...</Text>
        ) : (
          <FlatList
            data={data?.sports || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ color: "#666" }}>{item.location}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>Chưa có sân nào.</Text>}
          />
        )}
      </View>
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
