import { colors } from "@/lib/colors";
import { Stack } from "expo-router";

export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Log Item" }} />
      <Stack.Screen name="calories" options={{ title: "Log Calories" }} />
      <Stack.Screen name="workout" options={{ title: "Log Workout" }} />
      <Stack.Screen name="scan" options={{ title: "Scan Barcode" }} />
      <Stack.Screen name="presets" options={{ title: "Presets" }} />

      <Stack.Screen name="test" options={{ title: "Test" }} />
    </Stack>
  );
}
