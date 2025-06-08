import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apolloClient } from "../config/apollo";
import authService from "../services/auth";
import { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from AsyncStorage when app starts
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);

        // Check if user still has valid tokens
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          setUserState(parsedUser);
        } else {
          // Tokens expired or don't exist, clear user data
          await AsyncStorage.removeItem("user");
          setUserState(null);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Clear potentially corrupted data
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

      // Clear Apollo cache when user changes
      if (!newUser) {
        await apolloClient.clearStore();
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Call auth service logout (which handles backend logout and token clearing)
      await authService.logout();

      // Clear user data from context and storage
      await handleSetUser(null);

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if logout fails, clear local data
      await handleSetUser(null);
      throw error; // Re-throw to let UI handle error display
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        logout: handleLogout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
