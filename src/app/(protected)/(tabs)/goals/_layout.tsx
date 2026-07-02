import { Stack } from "expo-router";

export default function GoalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: "transparent" },
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
