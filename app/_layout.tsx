import { Stack } from "expo-router";
import "../global.css";
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../config/apollo';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
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
        </Stack>
      </ApolloProvider>
    </AuthProvider>
  );
}
