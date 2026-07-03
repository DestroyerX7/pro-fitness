import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import NutritionLogItem from "@/components/NutritionLogItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useTheme from "@/hooks/useTheme";
import {
  createNutritionLog,
  createWorkoutLog,
  getNutritionLogPresets,
  getWorkoutLogPresets,
  NutritionLogPreset,
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

  const { data: nutritionLogPresets } = useQuery({
    queryKey: ["nutritionLogPresets", user.id],
    queryFn: getNutritionLogPresets,
  });

  const { data: workoutLogPresets } = useQuery({
    queryKey: ["workoutLogPresets", user.id],
    queryFn: getWorkoutLogPresets,
  });

  const createNutritionLogMutation = useMutation({
    mutationFn: createNutritionLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["nutritionLogs", user.id],
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
        text2: `${data.name} • ${data.durationMinutes} mins`,
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

  const logCalories = async (nutritionLogPreset: NutritionLogPreset) => {
    const consumedAtSqlTimestamp = toSqlTimestamp(new Date());

    createNutritionLogMutation.mutate({
      userId: user.id,
      name: nutritionLogPreset.name,
      calories: nutritionLogPreset.calories,
      imageUrl: nutritionLogPreset.imageUrl,
      consumedAt: consumedAtSqlTimestamp,
    });
  };

  const logWorkout = async (workoutLogPreset: WorkoutLogPreset) => {
    const performedAtSqlTimestamp = toSqlTimestamp(new Date());

    createWorkoutLogMutation.mutate({
      userId: user.id,
      name: workoutLogPreset.name,
      durationMinutes: workoutLogPreset.durationMinutes,
      performedAt: performedAtSqlTimestamp,
      icon: workoutLogPreset.icon,
    });
  };

  const handleEditNutritionLogPreset = async (nutritionLogPresetId: string) => {
    router.push({
      pathname: "/(protected)/edit/nutrition-log-preset/nutritionLogPresetId]",
      params: { nutritionLogPresetId },
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

  if (nutritionLogPresets === undefined || workoutLogPresets === undefined) {
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
        nutritionLogPresets.length > 0 ? (
          nutritionLogPresets.map((nutritionLogPreset) => (
            <Pressable
              onPress={() => logCalories(nutritionLogPreset)}
              key={nutritionLogPreset.id}
            >
              <NutritionLogItem
                id={nutritionLogPreset.id}
                name={nutritionLogPreset.name}
                imageUrl={nutritionLogPreset.imageUrl}
                calories={nutritionLogPreset.calories}
                onEdit={handleEditNutritionLogPreset}
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
              durationMinutes={workoutLogPreset.durationMinutes}
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
