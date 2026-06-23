import { colors } from "@/lib/colors";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function GoalsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: "transparent" },
        // headerTitleStyle: { color: theme.foreground },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Goals",
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
