import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="index" options={{ title: "Log Item" }} />
      <Stack.Screen name="calories" options={{ title: "Log Calories" }} />
      <Stack.Screen name="workout" options={{ title: "Log Workout" }} />
      <Stack.Screen name="scan" options={{ title: "Scan Barcode" }} />
      <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
    </Stack>
  );
}
