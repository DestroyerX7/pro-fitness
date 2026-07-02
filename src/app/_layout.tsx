import { SplashScreenController } from "@/components/SplashScreenController";
import ThemeProvider from "@/components/ThemeProvider";
import "@/global.css";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { toastConfig } from "@/lib/toastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SplashScreenController />

        <RootNavigator />

        <Toast config={toastConfig} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { data: authData } = authClient.useSession();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={authData !== null}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      <Stack.Protected guard={authData === null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
