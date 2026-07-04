import { Stack } from "expo-router";

export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerLargeTitleEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Log Item" }} />
      <Stack.Screen name="nutrition" options={{ title: "Log Calories" }} />
      <Stack.Screen name="workout" options={{ title: "Log Workout" }} />
      <Stack.Screen name="scan" options={{ title: "Scan Barcode" }} />
      <Stack.Screen name="preset" options={{ title: "Presets" }} />
      <Stack.Screen name="goal" options={{ title: "Create Goal" }} />
    </Stack>
  );
}
