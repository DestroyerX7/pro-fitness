import AuthProvider, { useAuth } from "@/components/AuthProvider";
import { SplashScreenController } from "@/components/SplashScreenController";
import ThemeProvider from "@/components/ThemeProvider";
import "@/global.css";
import useTheme from "@/hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Text, View } from "react-native";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";
// import { StatusBar } from "expo-status-bar";

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
          name="edit/calorieLog/[id]"
          options={{
            headerShown: true,
            title: "Edit Calorie Log",
            presentation: "formSheet",
            sheetAllowedDetents: [0.5, 1],
            sheetGrabberVisible: true,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={authData == null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "600" }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{ fontSize: 15 }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  // fully custom type, built from scratch
  loggedFood: ({ text1, text2 }) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>🍽️</Text>
      <View>
        <Text style={{ color: "white", fontWeight: "600" }}>{text1}</Text>
        <Text style={{ color: "#aaa", fontSize: 12 }}>{text2}</Text>
      </View>
    </View>
  ),
};
