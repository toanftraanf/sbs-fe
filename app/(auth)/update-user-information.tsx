import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import DatePickerField from "@/components/DatePickerField";
import GenderSelector from "@/components/GenderSelector";
import PickerField from "@/components/PickerField";
import RoleToggle from "@/components/RoleToggle";
import SportNowHeader from "@/components/SportNowHeader";
import { USER_LEVEL_OPTIONS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getUserById } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";
import { gql } from "@apollo/client";
import { apolloClient } from "@/config/apollo";

// Danh sách sports cố định
const SPORTS = [
  { id: 1, name: 'Bóng đá' },
  { id: 2, name: 'Cầu lông' },
  { id: 3, name: 'Tennis' },
  { id: 4, name: 'Bóng bàn' },
  { id: 5, name: 'Bóng rổ' },
  { id: 6, name: 'Bóng chuyền' },
  { id: 7, name: 'Bơi lội' },
  { id: 8, name: 'Chạy bộ' },
  { id: 9, name: 'Yoga' },
  { id: 10, name: 'Gym' },
];

// GraphQL mutation for updating user
const UPDATE_USER = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      fullName
      dob
      sex
      address
      userType
      level
      email
      phoneNumber
    }
  }
`;

// GraphQL mutation for adding favorite sport
const ADD_FAVORITE_SPORT = gql`
  mutation AddFavoriteSport($addFavoriteSportInput: AddFavoriteSportInput!) {
    addFavoriteSport(addFavoriteSportInput: $addFavoriteSportInput) {
      id
      userId
      sportId
    }
  }
`;

export default function UpdateUserInformation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"player" | "coach">("player");
  const [level, setLevel] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<number[]>([]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userData = await getUserById(parseInt(user.id));
        
        if (userData) {
          // Set form data
          setFullName(userData.fullName || "");
          setDateOfBirth(userData.dob ? new Date(userData.dob) : null);
          // Convert gender to lowercase for the UI
          setGender(userData.sex ? userData.sex.toLowerCase() : null);
          setAddress(userData.address || "");
          setRole(userData.userType?.toLowerCase() as "player" | "coach" || "player");
          setLevel(userData.level || null);
          
          // Load favorite sports
          try {
            const { data } = await apolloClient.query({
              query: gql`
                query GetUserFavoriteSports($userId: Int!) {
                  userFavoriteSports(userId: $userId) {
                    id
                  }
                }
              `,
              variables: {
                userId: parseInt(user.id)
              }
            });
            
            if (data?.userFavoriteSports) {
              setSelectedSports(data.userFavoriteSports.map((sport: any) => sport.id));
            }
          } catch (error) {
            console.error('Error loading favorite sports:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleUpdate = async () => {
    // Validate required fields
    if (!fullName || fullName.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập tên người dùng");
      return;
    }

    if (!dateOfBirth) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày sinh");
      return;
    }

    if (!gender) {
      Alert.alert("Lỗi", "Vui lòng chọn giới tính");
      return;
    }

    if (!address || address.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ");
      return;
    }

    if (!level) {
      Alert.alert("Lỗi", "Vui lòng chọn trình độ");
      return;
    }

    if (selectedSports.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một môn thể thao");
      return;
    }

    try {
      setLoading(true);
      
      // Update user information using GraphQL mutation
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_USER,
        variables: {
          updateUserInput: {
            id: parseInt(user?.id || "0"),
            fullName: fullName.trim(),
            dob: dateOfBirth.toISOString(),
            sex: gender.toUpperCase(),
            address: address.trim(),
            userType: role.toUpperCase(),
            level: level.toUpperCase(),
          }
        }
      });

      if (data?.updateUser) {
        // Sau khi cập nhật thông tin cơ bản thành công, cập nhật favorite sports
        try {
          // Thêm từng sport yêu thích một
          for (const sportId of selectedSports) {
            try {
              await apolloClient.mutate({
                mutation: ADD_FAVORITE_SPORT,
                variables: {
                  addFavoriteSportInput: {
                    userId: parseInt(user?.id || "0"),
                    sportId: sportId
                  }
                }
              });
            } catch (error) {
              console.error(`Error adding sport ${sportId}:`, error);
              // Continue with other sports even if one fails
            }
          }

          Alert.alert(
            "Thành công",
            "Cập nhật thông tin thành công",
            [
              {
                text: "OK",
                onPress: () => router.back()
              }
            ]
          );
        } catch (error) {
          console.error('Error updating favorite sports:', error);
          Alert.alert('Lỗi', 'Không thể cập nhật môn thể thao yêu thích');
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (sportId: number) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter(id => id !== sportId));
    } else {
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SportNowHeader 
        title="Cập nhật thông tin" 
        showBack={true}
      />
      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text className="text-center text-gray-700 mb-4 mt-2">
          Cập nhật thông tin cá nhân của bạn
        </Text>

        <View className="mb-4">
          <Text className="mb-1 font-InterSemiBold">Tên người dùng</Text>
          <AppTextInput
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            containerClassName="mb-0"
          />
        </View>

        <DatePickerField
          label="Độ tuổi"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          placeholder="Chọn ngày sinh"
          maximumDate={new Date()}
        />

        <GenderSelector label="Giới tính" value={gender} onChange={setGender} />

        <View className="mb-4">
          <Text className="mb-1 font-InterSemiBold">Vị trí</Text>
          <AppTextInput
            left={
              <Ionicons name="location-outline" size={20} color="#515151" />
            }
            placeholder="Nhập địa chỉ của bạn"
            value={address}
            onChangeText={setAddress}
            containerClassName="mb-0"
          />
        </View>

        <RoleToggle label="Tư cách" value={role} onChange={setRole} />

        <PickerField
          label="Trình độ"
          value={level}
          onChange={setLevel}
          options={USER_LEVEL_OPTIONS}
          placeholder="Chọn trình độ của bạn"
        />

        {/* Sports Selection */}
        <View className="mb-4">
          <Text className="mb-1 font-InterSemiBold">Môn thể thao yêu thích</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                onPress={() => toggleSport(sport.id)}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  selectedSports.includes(sport.id)
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`${
                      selectedSports.includes(sport.id)
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {sport.name}
                  </Text>
                  {selectedSports.includes(sport.id) && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="white"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View className="items-center justify-center py-4">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <AppButton
            title="Cập nhật"
            filled
            onPress={handleUpdate}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 