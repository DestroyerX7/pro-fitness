import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="calories" />
      <Stack.Screen name="workout" />
    </Stack>
  );
}
