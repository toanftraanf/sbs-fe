import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

const ACTIVE_COLOR = "#5A983B";
const INACTIVE_COLOR = "#B0B0B0";

export default function Layout() {
  const { user } = useAuth();

  console.log(user?.role);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Inter_700Bold",
          fontSize: 14,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 80,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Trang chủ
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Lịch đặt",
          href: user?.role === "OWNER" ? undefined : null,
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="calendar-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Lịch đặt
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stadium-status"
        options={{
          title: "Trạng thái sân",
          href: user?.role === "OWNER" ? undefined : null,
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="stats-chart-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Trạng thái sân
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="team-matching"
        options={{
          title: "Ghép đội",
          href: user?.role === "CUSTOMER" ? undefined : null,
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="people-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Ghép đội
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: "Huấn luyện viên",
          href: user?.role === "CUSTOMER" ? undefined : null,
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="accessibility-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-center text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Huấn luyện viên
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stadium-booking"
        options={{
          title: "Đặt sân",
          href: user?.role === "CUSTOMER" ? undefined : null,
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="browsers-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Đặt sân
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="setting" 
        options={{
          title: "Cài đặt",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
              className={focused ? "text-primary" : "text-gray-400"}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <View className="items-center">
              <Text
                className={`font-InterBold text-xs ${
                  focused ? "text-primary" : "text-gray-400"
                }`}
              >
                Cài đặt
              </Text>
              {focused && (
                <View className="w-6 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
