import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ApolloProvider } from "@apollo/client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { apolloClient } from "../config/apollo";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        <SubscriptionProvider>
          <AuthGuard>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <Stack initialRouteName="onboarding">
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
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
                name="stadium-booking/booking-success"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="stadium-list/stadium-list"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profile/profile"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="stadium-booking/review"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="stadium-booking/submit-review"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="stadium-booking/booking-history"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="events/create-event"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="coach/coach-profile"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="events/event-preview"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="events/event-success"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="events/event-detail"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="subscription/subscription"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="payment/payment-method"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="payment/payment-success"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="payment/payment-insert-card"
                options={{ headerShown: false }}
              />
            </Stack>
          </AuthGuard>
        </SubscriptionProvider>
      </ApolloProvider>
    </AuthProvider>
  );
}
