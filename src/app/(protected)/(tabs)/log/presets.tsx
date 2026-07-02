import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useTheme from "@/hooks/useTheme";
import {
  CalorieLogPreset,
  createCalorieLog,
  createWorkoutLog,
  getCalorieLogPresets,
  getWorkoutLogPresets,
  WorkoutLogPreset,
} from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Favorites() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const [activeTab, setActiveTab] = useState<"calories" | "workouts">(
    "calories",
  );

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { data: calorieLogPresets } = useQuery({
    queryKey: ["calorieLogPresets", user.id],
    queryFn: getCalorieLogPresets,
  });

  const { data: workoutLogPresets } = useQuery({
    queryKey: ["workoutLogPresets", user.id],
    queryFn: getWorkoutLogPresets,
  });

  const createCalorieLogMutation = useMutation({
    mutationFn: createCalorieLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", user.id],
      });

      Toast.show({
        type: "loggedCalories",
        text1: "Logged!",
        text2: `${data.name} • ${data.calories} cal`,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", user.id],
      });

      Toast.show({
        type: "loggedWorkout",
        text1: "Logged!",
        text2: `${data.name} • ${data.duration} mins`,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const logCalories = async (calorieLogPreset: CalorieLogPreset) => {
    const consumedAtSqlTimestamp = toSqlTimestamp(new Date());

    createCalorieLogMutation.mutate({
      userId: user.id,
      name: calorieLogPreset.name,
      calories: calorieLogPreset.calories,
      imageUrl: calorieLogPreset.imageUrl,
      consumedAt: consumedAtSqlTimestamp,
    });
  };

  const logWorkout = async (workoutLogPreset: WorkoutLogPreset) => {
    const performedAtSqlTimestamp = toSqlTimestamp(new Date());

    createWorkoutLogMutation.mutate({
      userId: user.id,
      name: workoutLogPreset.name,
      duration: workoutLogPreset.duration,
      performedAt: performedAtSqlTimestamp,
      icon: workoutLogPreset.icon,
    });
  };

  const handleEditCalorieLogPreset = async (calorieLogPresetId: string) => {
    router.push({
      pathname: "/edit/calorie-log-preset/[calorieLogPresetId]",
      params: { calorieLogPresetId },
    });

    await Haptics.selectionAsync();
  };

  const handleEditWorkoutLogPreset = async (workoutLogPresetId: string) => {
    router.push({
      pathname: "/edit/workout-log-preset/[workoutLogPresetId]",
      params: { workoutLogPresetId },
    });

    await Haptics.selectionAsync();
  };

  if (calorieLogPresets === undefined || workoutLogPresets === undefined) {
    return;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4 gap-4"
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 flex-1"
      >
        <TabButton
          text="Calories"
          active={activeTab === "calories"}
          onPress={() => setActiveTab("calories")}
        />

        <TabButton
          text="Workouts"
          active={activeTab === "workouts"}
          onPress={() => setActiveTab("workouts")}
        />
      </ScrollView>

      {activeTab === "calories" ? (
        calorieLogPresets.length > 0 ? (
          calorieLogPresets.map((calorieLogPreset) => (
            <Pressable
              onPress={() => logCalories(calorieLogPreset)}
              key={calorieLogPreset.id}
            >
              <CalorieLogItem
                id={calorieLogPreset.id}
                name={calorieLogPreset.name}
                imageUrl={calorieLogPreset.imageUrl}
                calories={calorieLogPreset.calories}
                onEdit={handleEditCalorieLogPreset}
              />
            </Pressable>
          ))
        ) : (
          <View className="p-4 border border-border rounded-xl items-center">
            <MaterialCommunityIcons
              name="tune"
              size={64}
              color={theme.foreground}
            />

            <ThemedText className="text-2xl font-bold">
              No saved calorie presets
            </ThemedText>

            <ThemedText className="text-muted-foreground text-center">
              Edit a calorie log and press create preset based off it&apos;s
              values
            </ThemedText>
          </View>
        )
      ) : workoutLogPresets.length > 0 ? (
        workoutLogPresets.map((workoutLogPreset) => (
          <Pressable
            onPress={() => logWorkout(workoutLogPreset)}
            key={workoutLogPreset.id}
          >
            <WorkoutLogItem
              id={workoutLogPreset.id}
              name={workoutLogPreset.name}
              duration={workoutLogPreset.duration}
              workoutLogIcon={workoutLogPreset.icon}
              onEdit={handleEditWorkoutLogPreset}
            />
          </Pressable>
        ))
      ) : (
        <View className="p-4 border border-border rounded-xl items-center">
          <MaterialCommunityIcons
            name="tune"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-2xl font-bold">
            No saved workout presets
          </ThemedText>

          <ThemedText className="text-muted-foreground text-center">
            Edit a workout log and press create preset based off it&apos;s
            values
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}
