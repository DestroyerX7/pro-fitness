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
          name="edit/calorie-log/[calorieLogId]"
          options={{
            headerShown: true,
            title: "Edit Calorie Log",
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
          name="edit/calorie-log-preset/[calorieLogPresetId]"
          options={{
            headerShown: true,
            title: "Edit Calorie Log Preset",
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
          name="edit/user"
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
