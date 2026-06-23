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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function Favorites() {
  const { user } = useAuthenticatedAuth();

  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"calories" | "workouts">(
    "calories",
  );

  const theme = useTheme();

  const { data: calorieLogPresets } = useQuery({
    queryKey: ["calorieLogPresets", user.id],
    queryFn: () => getCalorieLogPresets(user.id),
  });

  const createCalorieLogMutation = useMutation({
    mutationFn: createCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", user.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const { data: workoutLogPresets } = useQuery({
    queryKey: ["workoutLogPresets", user.id],
    queryFn: () => getWorkoutLogPresets(user.id),
  });

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", user.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.log(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const logCalories = async (calorieLogPreset: CalorieLogPreset) => {
    createCalorieLogMutation.mutate({
      userId: user.id,
      name: calorieLogPreset.name,
      calories: calorieLogPreset.calories,
      imageUrl: calorieLogPreset.imageUrl,
      consumedAt: new Date().toISOString(),
    });
  };

  const logWorkout = async (workoutLogPreset: WorkoutLogPreset) => {
    createWorkoutLogMutation.mutate({
      userId: user.id,
      name: workoutLogPreset.name,
      duration: workoutLogPreset.duration,
      performedAt: new Date().toISOString(),
      iconLibrary: workoutLogPreset.iconLibrary,
      iconName: workoutLogPreset.iconName,
    });
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

      {/* Add editing later */}
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

            <ThemedText color="text-muted-foreground" className="text-center">
              Edit a calorie log and press create preset based off it&apos;s values
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
              iconLibrary={workoutLogPreset.iconLibrary}
              iconName={workoutLogPreset.iconName}
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

          <ThemedText color="text-muted-foreground" className="text-center">
            Edit a workout log and press create preset based off it&apos;s values
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}
