import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (isLoading || checkingRef.current) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";
    const inMenu = segments[0] === "menu";
    const currentRoute = segments.join("/");

    const isProfileCompletionRoute =
      currentRoute.includes("user-information") ||
      currentRoute.includes("stadium-information");

    if (user) {
      if (inAuthGroup) {
        if (isProfileCompletionRoute) {
          console.log(
            "🔓 AuthGuard: Allowing access to profile completion route:",
            currentRoute
          );
          return;
        }
        console.log("🔄 AuthGuard: Redirecting from auth route to tabs");
        router.replace("/(tabs)");
        return;
      }

      if ((inOnboarding || inMenu || inTabsGroup) && !profileChecked) {
        checkProfileCompletion();
        return;
      }

      // If user is authenticated with complete profile but on onboarding/menu, redirect to main app
      if ((inOnboarding || inMenu) && profileChecked) {
        console.log(
          "🔄 AuthGuard: Authenticated user with complete profile, redirecting to main app"
        );
        router.replace("/(tabs)");
        return;
      }
    } else {
      if (inTabsGroup) {
        router.replace("/onboarding");
        return;
      }
    }
  }, [user, isLoading, segments, profileChecked]);

  const checkProfileCompletion = async () => {
    if (!user?.id || checkingRef.current || profileChecked) return;

    checkingRef.current = true;
    setIsCheckingProfile(true);

    try {
      // Quick check: if user context already has the required fields
      if (user.fullName && user.dob && user.sex) {
        console.log(
          "✅ AuthGuard: Profile complete (from context), allowing access"
        );
        setProfileChecked(true);
        return;
      }

      console.log("🔍 AuthGuard: Fetching user profile from backend...");
      const userProfile = await authService.getUserProfile(parseInt(user.id));

      const hasFullName =
        userProfile?.fullName && userProfile.fullName.trim() !== "";
      const hasDob = userProfile?.dob && userProfile.dob !== null;
      const hasSex = userProfile?.sex && userProfile.sex !== null;

      console.log("🔍 AuthGuard: Profile check result:", {
        hasFullName,
        hasDob,
        hasSex,
        role: user.role,
      });

      if (!hasFullName || !hasDob || !hasSex) {
        console.log(
          "⚠️ AuthGuard: Profile incomplete, redirecting to user-information"
        );
        router.replace("/(auth)/user-information");
        return;
      }

      console.log("✅ AuthGuard: Profile complete, allowing access");
      setProfileChecked(true);
    } catch (error) {
      console.error("❌ AuthGuard: Error checking profile:", error);
      console.log(
        "⚠️ AuthGuard: Profile check failed, redirecting to user-information"
      );
      router.replace("/(auth)/user-information");
    } finally {
      checkingRef.current = false;
      setIsCheckingProfile(false);
    }
  };

  if (isLoading || isCheckingProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#5A983B" />
      </View>
    );
  }

  return <>{children}</>;
}
