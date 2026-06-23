import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{ title: "History", headerLargeTitleEnabled: true }}
    />
  );
}
