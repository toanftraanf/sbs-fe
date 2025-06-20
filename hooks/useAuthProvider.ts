import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { apolloClient } from "../config/apollo";
import authService from "../services/auth";
import { AuthContextType, User } from "../types";

export default function useAuthProvider(): AuthContextType {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          setUserState(parsedUser);
        } else {
          await AsyncStorage.removeItem("user");
          setUserState(null);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      await AsyncStorage.removeItem("user");
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetUser = async (newUser: User | null) => {
    try {
      if (newUser) {
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem("user");
      }
      setUserState(newUser);
      if (!newUser) {
        await apolloClient.clearStore();
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      await handleSetUser(null);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      await handleSetUser(null);
      throw error;
    }
  };

  return {
    user,
    setUser: handleSetUser,
    logout: handleLogout,
    isLoading,
  };
} 