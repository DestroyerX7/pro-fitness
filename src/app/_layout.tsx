import AuthProvider, { useAuth } from "@/components/AuthProvider";
import { SplashScreenController } from "@/components/SplashScreenController";
import ThemeProvider from "@/components/ThemeProvider";
import "@/global.css";
import useTheme from "@/hooks/useTheme";
import { toastConfig } from "@/lib/toastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SplashScreenController />

          <RootNavigator />

          <Toast config={toastConfig} />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { data: authData } = useAuth();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={authData !== null}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="edit/calorie-log/[calorieLogId]"
          options={{
            headerShown: true,
            title: "Edit Calorie Log",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/workout-log/[workoutLogId]"
          options={{
            headerShown: true,
            title: "Edit Workout Log",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/goal/[goalId]"
          options={{
            headerShown: true,
            title: "Edit Goal",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/calorie-log-preset/[calorieLogPresetId]"
          options={{
            headerShown: true,
            title: "Edit Calorie Log Preset",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={authData === null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
