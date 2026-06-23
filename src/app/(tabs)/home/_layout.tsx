import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ title: "Home", headerLargeTitleEnabled: true }} />
  );
}
