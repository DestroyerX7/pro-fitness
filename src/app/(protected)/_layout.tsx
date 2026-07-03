import { AuthenticatedAuthProvider } from "@/components/AuthenticatedAuthProvider";
import useTheme from "@/hooks/useTheme";
import { Stack } from "expo-router";

export default function ProtectedLayout() {
  const theme = useTheme();

  return (
    <AuthenticatedAuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="edit/nutrition-log/[nutritionLogId]"
          options={{
            headerShown: true,
            title: "Edit Nutrition Log",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/workout-log/[workoutLogId]"
          options={{
            headerShown: true,
            title: "Edit Workout Log",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/goal/[goalId]"
          options={{
            headerShown: true,
            title: "Edit Goal",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/nutrition-log-preset/[nutritionLogPresetId]"
          options={{
            headerShown: true,
            title: "Edit Nutrition Log Preset",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/workout-log-preset/[workoutLogPresetId]"
          options={{
            headerShown: true,
            title: "Edit Workout Log Preset",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <Stack.Screen
          name="edit/profile"
          options={{
            headerShown: true,
            title: "Edit Profile",
            presentation: "modal",
            contentStyle: { backgroundColor: theme.background },
          }}
        />
      </Stack>
    </AuthenticatedAuthProvider>
  );
}
