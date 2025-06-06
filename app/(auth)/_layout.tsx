import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ title: "Đăng nhập", headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ title: "Đăng ký", headerShown: false }}
      />
      <Stack.Screen
        name="register-user"
        options={{ title: "Đăng ký người dùng", headerShown: false }}
      />
      <Stack.Screen
        name="register-owner"
        options={{ title: "Đăng ký chủ sân", headerShown: false }}
      />
      <Stack.Screen
        name="verify-otp"
        options={{ title: "Xác thực OTP", headerShown: false }}
      />
      <Stack.Screen
        name="user-information-step1"
        options={{ title: "Thông tin cá nhân 1", headerShown: false }}
      />
      <Stack.Screen
        name="user-information-step2"
        options={{ title: "Thông tin cá nhân 2", headerShown: false }}
      />
      <Stack.Screen
        name="stadium-information-step1"
        options={{ title: "Thông tin sân tập 1", headerShown: false }}
      />
      <Stack.Screen
        name="stadium-information-step2"
        options={{ title: "Thông tin sân tập 2", headerShown: false }}
      />
      <Stack.Screen
        name="stadium-information-step3"
        options={{ title: "Thông tin sân tập 3", headerShown: false }}
      />
    </Stack>
  );
};

export default AuthLayout;
