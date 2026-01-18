import { useAuth } from "@/components/AuthProvider";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
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

  useEffect(() => {
    const getCalorieLogPresets = async () => {
      const response = await axios.get(
        `${baseUrl}/api/get-calorie-log-presets/${data?.user.id}`,
      );

      setCalorieLogPresets(response.data.calorieLogPresets);
    };

    const getWorkoutLogPresets = async () => {
      const response = await axios.get(
        `${baseUrl}/api/get-workout-log-presets/${data?.user.id}`,
      );

      setWorkoutLogPresets(response.data.workoutLogPresets);
    };

    getCalorieLogPresets();
    getWorkoutLogPresets();
  });

  const logCalories = async (calorieLogPreset: CalorieLogPreset) => {
    await axios.post(`${baseUrl}/api/log-calories`, {
      userId: data?.user.id,
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
          <Text
            className={`text-2xl text-foreground ${activeTab === "calories" ? "font-bold" : ""}`}
          >
            Calories
          </Text>
        </Pressable>

        <Pressable
          className={`border-b-2 ${
            activeTab === "workouts"
              ? "border-foreground"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("workouts")}
        >
          <Text
            className={`text-2xl text-foreground ${activeTab === "workouts" ? "font-bold" : ""}`}
          >
            Workouts
          </Text>
        </Pressable>
      </View>

      {activeTab === "calories" ? (
        calorieLogPresets.length > 0 ? (
          calorieLogPresets.map((calorieLogPreset) => (
            <Pressable
              onPress={() => logCalories(calorieLogPreset)}
              className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border"
              key={calorieLogPreset.id}
            >
              {calorieLogPreset.imageUrl !== null ? (
                <Image
                  className="w-16 h-16 rounded-md"
                  source={{ uri: calorieLogPreset.imageUrl }}
                />
              ) : (
                <View className="w-16 h-16 border rounded-md border-border items-center justify-center">
                  <MaterialCommunityIcons
                    name="food"
                    size={32}
                    color={colors.foreground}
                  />
                </View>
              )}

              <View className="flex-1 gap-2">
                <Text className="text-lg font-bold text-foreground">
                  {calorieLogPreset.name}
                </Text>

                <Text className="text-secondaryForeground">
                  {calorieLogPreset.calories}
                </Text>
              </View>

              <Pressable>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
            </Pressable>
          ))
        ) : (
          <View className="p-4 border border-border rounded-lg items-center">
            <MaterialCommunityIcons
              name="tune"
              size={64}
              color={colors.foreground}
            />

            <Text className="text-foreground text-2xl font-bold">
              No saved calorie presets
            </Text>

            <Text className="text-secondaryForeground text-center">
              Edit a calorie log and press create preset based off it's values
            </Text>
          </View>
        )
      ) : workoutLogPresets.length > 0 ? (
        workoutLogPresets.map((workoutLogPreset) => {
          const IconComponent = iconLibraries[workoutLogPreset.iconLibrary];

          return (
            <Pressable
              onPress={() => logWorkout(workoutLogPreset)}
              className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border"
              key={workoutLogPreset.id}
            >
              <IconComponent
                name={workoutLogPreset.iconName as any}
                size={48}
                color={colors.foreground}
              />

              <View className="flex-1 gap-2">
                <Text className="text-lg font-bold text-foreground">
                  {workoutLogPreset.name}
                </Text>
                <Text className="text-secondaryForeground">
                  {workoutLogPreset.duration} minutes
                </Text>
              </View>

              <Pressable>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
            </Pressable>
          );
        })
      ) : (
        <View className="p-4 border border-border rounded-lg items-center">
          <MaterialCommunityIcons
            name="tune"
            size={64}
            color={colors.foreground}
          />

          <Text className="text-foreground text-2xl font-bold">
            No saved workout presets
          </Text>

          <Text className="text-secondaryForeground text-center">
            Edit a workout log and press create preset based off it's values
          </Text>
        </View>
      )}
    </View>
  );
}
