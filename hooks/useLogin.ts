import { router } from "expo-router";
import { useState } from "react";
import authService from "../services/auth";

export default function useLogin() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Format phone number to remove any spaces or special characters
      let formattedPhone = phone.replace(/\D/g, "");

      // Ensure phone number starts with 0 for Vietnamese format
      if (!formattedPhone.startsWith("0") && formattedPhone.length >= 9) {
        formattedPhone = "0" + formattedPhone;
      }

      // First check if user exists as CUSTOMER
      let user = await authService.checkExistingUser(
        formattedPhone,
        "CUSTOMER"
      );

      // If not found as CUSTOMER, check as OWNER
      if (!user) {
        user = await authService.checkExistingUser(formattedPhone, "OWNER");
      }

      if (user) {
        // User exists, proceed to OTP verification for login
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { phoneNumber: formattedPhone, isLogin: "true" },
        });
      } else {
        // User doesn't exist, redirect to registration
        router.push({
          pathname: "/(auth)/register-user",
          params: { phoneNumber: formattedPhone },
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phone,
    setPhone,
    isLoading,
    error,
    handleSendOTP,
    setError,
  };
} 