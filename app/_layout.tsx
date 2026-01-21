import AuthProvider, { useAuth } from "@/components/AuthProvider";
import { SplashScreenController } from "@/components/SplashScreenController";
import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SplashScreenController />

      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { data } = useAuth();

  return (
    <View className="dark flex-1">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={data !== null}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={data == null}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
