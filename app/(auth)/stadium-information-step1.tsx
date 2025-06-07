import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import * as stadiumApi from "@/services/stadium";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import AppButton from "../../components/AppButton";
import SportNowHeader from "../../components/SportNowHeader";

export default function StadiumInformationStep1() {
  // State for all fields
  const [stadiumName, setStadiumName] = useState("");
  const [googleMap, setGoogleMap] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [otherContacts, setOtherContacts] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("05:00");
  const [endTime, setEndTime] = useState("21:00");
  const [otherInfo, setOtherInfo] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { stadiumId } = useLocalSearchParams();

  // Dummy sports list
  const SPORTS = [
    { key: "tennis", label: "Quần vợt" },
    { key: "tabletennis", label: "Bóng bàn" },
    { key: "badminton", label: "Cầu lông" },
    { key: "pickleball", label: "Pickleball" },
  ];

  useEffect(() => {
    if (stadiumId) {
      fetchStadiumData();
    }
  }, [stadiumId]);

  const fetchStadiumData = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getStadiumStep1(parseInt(stadiumId as string));
      setStadiumName(data.name);
      setGoogleMap(data.googleMap);
      setPhone(data.phone);
      setEmail(data.email);
      setWebsite(data.website);
      setOtherContacts(data.otherContacts.length > 0 ? data.otherContacts : [""]);
      setDescription(data.description);
      setStartTime(data.startTime);
      setEndTime(data.endTime);
      setOtherInfo(data.otherInfo);
      setSelectedSports(data.sports);
    } catch (err) {
      console.error('Error fetching stadium data:', err);
      alert('Không thể tải dữ liệu sân tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      const payload = {
        name: stadiumName,
        googleMap,
        phone,
        email,
        website,
        otherContacts,
        description,
        startTime,
        endTime,
        otherInfo,
        sports: selectedSports,
      };
      console.log('Payload gửi lên backend:', payload);
      
      const id = await stadiumApi.createStadiumStep1(payload);
      // chuyển sang bước 2, truyền param stadiumId
      router.push({
        pathname: "/(auth)/stadium-information-step2",
        params: { stadiumId: id },
      });
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
      if (err instanceof Error) {
        alert('Lỗi: ' + err.message);
      } else {
        alert('Lỗi không xác định');
      }
    }
  };

  const toggleSport = (key: string) => {
    setSelectedSports((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
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
        {/* Stadium Name */}
        <TextInput
          placeholder="Tên cụm sân"
          value={stadiumName}
          onChangeText={setStadiumName}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Google Map Link */}
        <TextInput
          placeholder="Link Google Map"
          value={googleMap}
          onChangeText={setGoogleMap}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Phone */}
        <TextInput
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Website/Facebook */}
        <TextInput
          placeholder="Website hoặc link Facebook"
          value={website}
          onChangeText={setWebsite}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Other Contacts */}
        {otherContacts.map((contact, idx) => (
          <View key={idx} className="flex-row items-center mb-3">
            <TextInput
              placeholder="Điện thoại khác"
              value={contact}
              onChangeText={(text) => {
                const arr = [...otherContacts];
                arr[idx] = text;
                setOtherContacts(arr);
              }}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            />
            <TouchableOpacity
              onPress={() => setOtherContacts([...otherContacts, ""])}
              className="ml-2"
            >
              <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        ))}
        {/* Description */}
        <TextInput
          placeholder="Thông tin mô tả"
          value={description}
          onChangeText={setDescription}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
          multiline
          numberOfLines={3}
        />
        {/* Time */}
        <View className="flex-row items-center mb-3">
          <TextInput
            placeholder="05:00"
            value={startTime}
            onChangeText={setStartTime}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 mr-2"
          />
          <Text className="mx-2">đến</Text>
          <TextInput
            placeholder="21:00"
            value={endTime}
            onChangeText={setEndTime}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 ml-2"
          />
        </View>
        {/* Other Info */}
        <TextInput
          placeholder="Khác"
          value={otherInfo}
          onChangeText={setOtherInfo}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        />
        {/* Sports */}
        <View className="mb-6">
          <Text className="mb-2 font-InterSemiBold">Các môn thể thao</Text>
          <View className="flex-row flex-wrap">
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport.key}
                className={`px-4 py-2 rounded-full mr-2 mb-2 border ${selectedSports.includes(sport.key) ? "bg-primary border-primary" : "border-gray-300"}`}
                onPress={() => toggleSport(sport.key)}
              >
                <Text className={selectedSports.includes(sport.key) ? "text-white" : "text-primary"}>
                  {sport.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Navigation Buttons */}
        <View className="flex-row justify-between mb-8">
          <AppButton style={{width: "48%"}} title="Quay lại" filled={false} onPress={() => router.back()} />
          <AppButton style={{width: "48%"}} title="Tiếp tục" filled onPress={handleNext} />
        </View>
      </ScrollView>
    </View>
  );
}
