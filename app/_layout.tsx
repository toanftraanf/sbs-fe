import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApolloProvider } from "@apollo/client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { apolloClient } from "../config/apollo";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        <AuthGuard>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <Stack initialRouteName="onboarding">
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="menu" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="stadium-booking/stadium-detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="stadium-booking/booking-detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="stadium-list/stadium-list"
              options={{ headerShown: false }}
            />
          </Stack>
        </AuthGuard>
      </ApolloProvider>
    </AuthProvider>
  );
}
