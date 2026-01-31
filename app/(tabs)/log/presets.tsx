import { useAuth } from "@/components/AuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { iconLibraries } from "./workout";

export type CalorieLogPreset = {
  id: string;
  name: string;
  calories: number;
  imageUrl: string | null;
  createdAt: Date;
  userId: string;
};

export type WorkoutLogPreset = {
  id: string;
  name: string;
  duration: number;
  iconLibrary: "MaterialIcons" | "MaterialCommunityIcons";
  iconName: string;
  createdAt: Date;
  userId: string;
};

export default function Favorites() {
  const [calorieLogPresets, setCalorieLogPresets] = useState<
    CalorieLogPreset[]
  >([]);
  const [workoutLogPresets, setWorkoutLogPresets] = useState<
    WorkoutLogPreset[]
  >([]);

  const [activeTab, setActiveTab] = useState<"calories" | "workouts">(
    "calories",
  );

  const { data } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  useEffect(() => {
    const getCalorieLogPresets = async () => {
      if (data === null) {
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/get-calorie-log-presets/${data.user.id}`,
      );

      setCalorieLogPresets(response.data.calorieLogPresets);
    };

    const getWorkoutLogPresets = async () => {
      if (data === null) {
        return;
      }

      const response = await axios.get(
        `${baseUrl}/api/get-workout-log-presets/${data.user.id}`,
      );

      setWorkoutLogPresets(response.data.workoutLogPresets);
    };

    getCalorieLogPresets();
    getWorkoutLogPresets();
  });

  const logCalories = async (calorieLogPreset: CalorieLogPreset) => {
    if (data === null) {
      return;
    }

    await axios.post(`${baseUrl}/api/log-calories`, {
      userId: data.user.id,
      name: calorieLogPreset.name,
      calories: calorieLogPreset.calories,
      imageUrl: calorieLogPreset.imageUrl,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const logWorkout = async (workoutLogPreset: WorkoutLogPreset) => {
    await axios.post(`${baseUrl}/api/log-workout`, {
      userId: data?.user.id,
      name: workoutLogPreset.name,
      duration: workoutLogPreset.duration,
      iconLibrary: workoutLogPreset.iconLibrary,
      iconName: workoutLogPreset.iconName,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

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
        workoutLogPresets.map((workoutLogPreset) => {
          const IconComponent = iconLibraries[workoutLogPreset.iconLibrary];

          return (
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
          );
        })
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
