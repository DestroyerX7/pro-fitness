import { useAuth } from "@/components/AuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import {
  CalorieLogPreset,
  createCalorieLog,
  createWorkoutLog,
  getCalorieLogPresets,
  getWorkoutLogPresets,
  WorkoutLogPreset,
} from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

export default function Favorites() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"calories" | "workouts">(
    "calories",
  );

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const { data: calorieLogPresets } = useQuery({
    queryKey: ["calorieLogPresets", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getCalorieLogPresets(userId);
    },
    enabled: authData !== null,
  });

  const createCalorieLogMutation = useMutation({
    mutationFn: createCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const { data: workoutLogPresets } = useQuery({
    queryKey: ["workoutLogPresets", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getWorkoutLogPresets(userId);
    },
    enabled: authData !== null,
  });

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", authData?.user.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.log(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const logCalories = async (calorieLogPreset: CalorieLogPreset) => {
    if (authData === null) {
      return;
    }

    createCalorieLogMutation.mutate({
      userId: authData.user.id,
      name: calorieLogPreset.name,
      calories: calorieLogPreset.calories,
      imageUrl: calorieLogPreset.imageUrl,
      date: new Date().toLocaleDateString(),
    });
  };

  const logWorkout = async (workoutLogPreset: WorkoutLogPreset) => {
    if (authData === null) {
      return;
    }

    createWorkoutLogMutation.mutate({
      userId: authData.user.id,
      name: workoutLogPreset.name,
      duration: workoutLogPreset.duration,
      date: new Date().toLocaleDateString(),
      iconLibrary: workoutLogPreset.iconLibrary,
      iconName: workoutLogPreset.iconName,
    });
  };

  if (
    authData === null ||
    calorieLogPresets === undefined ||
    workoutLogPresets === undefined
  ) {
    return;
  }

  return (
    <View className="p-4 gap-4">
      <View className="flex-row gap-4 items-center">
        <Pressable
          className={`border-b-2 ${
            activeTab === "calories"
              ? "border-foreground"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("calories")}
        >
          <ThemedText
            className={`text-2xl ${activeTab === "calories" ? "font-bold" : ""}`}
          >
            Calories
          </ThemedText>
        </Pressable>

        <Pressable
          className={`border-b-2 ${
            activeTab === "workouts"
              ? "border-foreground"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("workouts")}
        >
          <ThemedText
            className={`text-2xl ${activeTab === "workouts" ? "font-bold" : ""}`}
          >
            Workouts
          </ThemedText>
        </Pressable>
      </View>

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
                colorScheme={colorScheme}
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
              Edit a calorie log and press create preset based off it's values
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
              colorScheme={colorScheme}
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
            Edit a workout log and press create preset based off it's values
          </ThemedText>
        </View>
      )}
    </View>
  );
}
