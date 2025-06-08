import env from "@/config/env";
import { icons } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";

interface GoogleLoginButtonProps {
  title?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({
  title = "Google",
  disabled = false,
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  // Configure Google OAuth request
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: env.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: env.GOOGLE_IOS_CLIENT_ID,
    webClientId: env.GOOGLE_WEB_CLIENT_ID,
    responseType: "id_token",
    scopes: ["profile", "email"],
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      if (!request) {
        throw new Error("Google Sign In configuration is not ready");
      }

      // Prompt for Google Sign In
      const result = await promptAsync();

      if (result.type === "success") {
        // Get the ID token
        const { id_token } = result.params;

        // Validate the token with our backend
        const user = await authService.validateGoogleToken(id_token);

        if (user) {
          // Save user to context
          setUser(user);

          // Call success callback or navigate
          if (onSuccess) {
            onSuccess();
          } else {
            // Default navigation based on user role
            if (user.role === "OWNER") {
              router.replace("/(tabs)/stadium-status");
            } else {
              router.replace("/(tabs)/stadium-booking");
            }
          }
        }
      } else if (result.type === "cancel") {
        throw new Error("Google sign in was cancelled");
      } else {
        throw new Error("Google sign in failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert("Lỗi đăng nhập", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center border-2 border-primary rounded-2xl py-3 mb-4"
      onPress={handleGoogleSignIn}
      disabled={isLoading || disabled || !request}
      style={{
        opacity: isLoading || disabled || !request ? 0.6 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color="#5A983B" />
      ) : (
        <>
          <Text className="font-InterBold text-primary text-lg mr-2">
            {title}
          </Text>
          <Image source={icons.google} className="w-10 h-10" />
        </>
      )}
    </TouchableOpacity>
  );
}
