import AuthProvider, { useAuth } from "@/components/AuthProvider";
import { SplashScreenController } from "@/components/SplashScreenController";
import ThemeProvider from "@/components/ThemeProvider";
import "@/global.css";
import { colors } from "@/lib/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SplashScreenController />

          <StatusBar style="auto" />
          <RootNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { data } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={data !== null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={data == null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
