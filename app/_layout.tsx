import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
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
  );
}
