import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface StadiumContactProps {
  phone: string;
  email: string;
}

const StadiumContact: React.FC<StadiumContactProps> = ({ phone, email }) => (
  <>
    <View className="pb-5">
      <View className="flex-row items-center mb-1">
        <Ionicons name="call-outline" size={18} color="#888" />
        <Text className="ml-2 text-gray-600 text-sm">SDT: {phone}</Text>
      </View>
      <View className="flex-row items-center mb-1">
        <MaterialIcons name="email" size={18} color="#888" />
        <Text className="ml-2 text-gray-600 text-sm">Mail: {email}</Text>
      </View>
    </View>
  </>
);

export default StadiumContact;
