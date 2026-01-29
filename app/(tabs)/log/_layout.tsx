import { colors } from "@/lib/colors";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function LogLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.foreground },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Log Item" }} />
      <Stack.Screen name="calories" options={{ title: "Log Calories" }} />
      <Stack.Screen name="workout" options={{ title: "Log Workout" }} />
      <Stack.Screen name="scan" options={{ title: "Scan Barcode" }} />
      <Stack.Screen name="presets" options={{ title: "Presets" }} />
      <Stack.Screen name="goal" options={{ title: "Create Goal" }} />
    </Stack>
  );
}
