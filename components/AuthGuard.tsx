import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";
    const inMenu = segments[0] === "menu";

    if (user) {
      // User is logged in
      if (inAuthGroup || inOnboarding || inMenu) {
        // Redirect to appropriate tab based on user role
        if (user.role === "OWNER") {
          router.replace("/(tabs)/stadium-status");
        } else {
          router.replace("/(tabs)/stadium-booking");
        }
      }
    } else {
      // User is not logged in
      if (inTabsGroup) {
        // Redirect to onboarding/menu if trying to access protected routes
        router.replace("/onboarding");
      }
    }
  }, [user, isLoading, segments]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#5A983B" />
      </View>
    );
  }

  return <>{children}</>;
}
