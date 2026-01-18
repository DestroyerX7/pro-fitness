import { useAuth } from "@/components/AuthProvider";
import EditCalorieLogModal from "@/components/EditCalorieLogModal";
import EditWorkoutLogModal from "@/components/EditWorkoutLogModal";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { iconLibraries } from "./log/workout";

export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  dailyCalorieGoal: number;
  dailyWorkoutGoal: number;
  createdAt: Date;
};

export type CalorieLog = {
  id: string;
  name: string;
  calories: number;
  date: Date;
  imageUrl: string | null;
  createdAt: Date;
  userId: string;
};

export type WorkoutLog = {
  id: string;
  name: string;
  duration: number;
  date: string;
  iconName: string;
  iconLibrary: "MaterialIcons" | "MaterialCommunityIcons";
  createdAt: Date;
  userId: string;
};

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const [editingCalorieLog, setEditingCalorieLog] = useState<CalorieLog | null>(
    null,
  );
  const [editingWorkoutLog, setEditingWorkoutLog] = useState<WorkoutLog | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<"calories" | "workouts">(
    "calories",
  );

  const { data } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const response: { data: { user: User } } = await axios.get(
          `${baseUrl}/api/get-user/${data?.user.id}`,
        );

        setUser(response.data.user);
      };

      const getCalorieLogs = async () => {
        const response: { data: { calorieLogs: CalorieLog[] } } =
          await axios.get(`${baseUrl}/api/get-calorie-logs/${data?.user.id}`);

        setCalorieLogs(
          response.data.calorieLogs
            .filter(
              (c) =>
                new Date(c.createdAt).toDateString() ==
                new Date().toDateString(),
            )
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
        );
      };

      const getWorkoutLogs = async () => {
        const response: { data: { workoutLogs: WorkoutLog[] } } =
          await axios.get(`${baseUrl}/api/get-workout-logs/${data?.user.id}`);

        setWorkoutLogs(
          response.data.workoutLogs
            .filter(
              (w) =>
                new Date(w.createdAt).toDateString() ==
                new Date().toDateString(),
            )
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
        );
      };

      getUser();
      getCalorieLogs();
      getWorkoutLogs();
    }, []),
  );

  const editDailyCalorieGoal = async (user: User) => {
    Alert.prompt(
      "Edit calorie goal",
      "Update your daily calorie goal",
      async (text) => {
        const response: { data: { user: User } } = await axios.patch(
          `${baseUrl}/api/update-daily-calorie-goal/${user.id}`,
          {
            dailyCalorieGoal: Number(text),
          },
        );

        setUser(response.data.user);
      },
      "plain-text",
      user.dailyCalorieGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const editDailyWorkoutGoal = async (user: User) => {
    Alert.prompt(
      "Edit workout goal",
      "Update your daily workout goal",
      async (text) => {
        const response: { data: { user: User } } = await axios.patch(
          `${baseUrl}/api/update-daily-workout-goal/${user.id}`,
          {
            dailyWorkoutGoal: Number(text),
          },
        );

        setUser(response.data.user);
      },
      "plain-text",
      user.dailyWorkoutGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const editCalorieLog = async (calorieLog: CalorieLog) => {
    setEditingCalorieLog(calorieLog);
    await Haptics.selectionAsync();
  };

  const editWorkoutLog = async (workoutLog: WorkoutLog) => {
    setEditingWorkoutLog(workoutLog);
    await Haptics.selectionAsync();
  };

  const saveCalorieLog = async (editedCalorieLog: CalorieLog) => {
    if (editedCalorieLog === editingCalorieLog) {
      console.log("Same");
      return;
    }

    await axios.put(
      `${baseUrl}/api/update-calorie-log/${editedCalorieLog.id}`,
      {
        name: editedCalorieLog.name,
        calories: editedCalorieLog.calories,
        date: editedCalorieLog.date,
        imageUrl: editedCalorieLog.imageUrl,
      },
    );

    setCalorieLogs(
      calorieLogs.map((calorieLog) => {
        if (calorieLog.id === editedCalorieLog.id) {
          return editedCalorieLog;
        }

        return calorieLog;
      }),
    );
    setEditingCalorieLog(null);
  };

  const saveWorkoutLog = async (editedWorkoutLog: WorkoutLog) => {
    if (editedWorkoutLog === editingWorkoutLog) {
      console.log("Same");
      return;
    }

    await axios.put(
      `${baseUrl}/api/update-workout-log/${editedWorkoutLog.id}`,
      {
        name: editedWorkoutLog.name,
        duration: editedWorkoutLog.duration,
        date: editedWorkoutLog.date,
        iconLibrary: editedWorkoutLog.iconLibrary,
        iconName: editedWorkoutLog.iconName,
      },
    );

    setWorkoutLogs(
      workoutLogs.map((workoutLog) => {
        if (workoutLog.id === editedWorkoutLog.id) {
          return editedWorkoutLog;
        }

        return workoutLog;
      }),
    );
    setEditingWorkoutLog(null);
  };

  const deleteCalorieLog = async (calorieLogId: string) => {
    await axios.delete(`${baseUrl}/api/delete-calorie-log/${calorieLogId}`);

    setCalorieLogs(calorieLogs.filter((c) => c.id !== calorieLogId));
    setEditingCalorieLog(null);
  };

  const deleteWorkoutLog = async (workoutLogId: string) => {
    await axios.delete(`${baseUrl}/api/delete-workout-log/${workoutLogId}`);

    setWorkoutLogs(workoutLogs.filter((w) => w.id !== workoutLogId));
    setEditingWorkoutLog(null);
  };

  if (user === null) {
    return;
  }

  const loggedCalories = calorieLogs.reduce((a, b) => a + b.calories, 0);
  const loggedWorkoutTime = workoutLogs.reduce((a, b) => a + b.duration, 0);

  return (
    <SafeAreaView className="pt-4 px-4 gap-4 flex-1" edges={["top"]}>
      {editingCalorieLog !== null && (
        <EditCalorieLogModal
          calorieLog={editingCalorieLog}
          close={() => setEditingCalorieLog(null)}
          onSave={saveCalorieLog}
          onDelete={deleteCalorieLog}
        />
      )}

      {editingWorkoutLog !== null && (
        <EditWorkoutLogModal
          workoutLog={editingWorkoutLog}
          close={() => setEditingWorkoutLog(null)}
          onSave={saveWorkoutLog}
          onDelete={deleteWorkoutLog}
        />
      )}

      <Text className="text-4xl font-bold text-foreground">Home</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <View className="bg-white p-4 border rounded-xl border-border gap-4">
            <View className="flex-row justify-between">
              <Text className="text-2xl font-bold text-foreground">
                Today's Calories
              </Text>

              <Pressable onPress={() => editDailyCalorieGoal(user)}>
                <MaterialIcons
                  name="mode-edit"
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
            </View>

            <Text className="text-foreground">
              <Text className="text-4xl font-bold">{loggedCalories}</Text> /{" "}
              {user.dailyCalorieGoal}
            </Text>

            <View className="h-8 bg-secondary rounded-full">
              <View
                className="h-full bg-[#30d030] rounded-full"
                style={{
                  width: `${Math.min((loggedCalories / user.dailyCalorieGoal) * 100, 100)}%`,
                }}
              />
            </View>

            <View className="flex-row justify-between">
              <Text className="text-secondaryForeground">
                {Math.max(user.dailyCalorieGoal - loggedCalories, 0)} calories
                remaining
              </Text>

              <Text className="text-secondaryForeground">
                {((loggedCalories / user.dailyCalorieGoal) * 100).toFixed(2)}%
              </Text>
            </View>
          </View>

          <View className="bg-white p-4 border rounded-xl border-border gap-4">
            <View className="flex-row justify-between">
              <Text className="text-2xl font-bold text-foreground">
                Workout Time
              </Text>

              <Pressable onPress={() => editDailyWorkoutGoal(user)}>
                <MaterialIcons
                  name="mode-edit"
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
            </View>

            <Text className="text-foreground">
              <Text className="text-4xl font-bold">{loggedWorkoutTime}</Text> /{" "}
              {user.dailyWorkoutGoal}
            </Text>

            <View className="h-8 bg-secondary rounded-full">
              <View
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min((loggedWorkoutTime / user.dailyWorkoutGoal) * 100, 100)}%`,
                }}
              />
            </View>

            <View className="flex-row justify-between">
              <Text className="text-secondaryForeground">
                {Math.max(user.dailyWorkoutGoal - loggedWorkoutTime, 0)} mins
                remaining
              </Text>

              <Text className="text-secondaryForeground">
                {((loggedWorkoutTime / user.dailyWorkoutGoal) * 100).toFixed(2)}
                %
              </Text>
            </View>
          </View>

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
            calorieLogs.length > 0 ? (
              calorieLogs.map((calorieLog) => (
                <View
                  className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border"
                  key={calorieLog.id}
                >
                  {calorieLog.imageUrl !== null ? (
                    <Image
                      className="w-16 h-16 rounded-md"
                      source={{ uri: calorieLog.imageUrl }}
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
                      {calorieLog.name}
                    </Text>

                    <Text className="text-secondaryForeground">
                      {calorieLog.calories}
                    </Text>
                  </View>

                  <Pressable onPress={() => editCalorieLog(calorieLog)}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={24}
                      color={colors.foreground}
                    />
                  </Pressable>
                </View>
              ))
            ) : (
              <View className="gap-4 items-center p-4">
                <MaterialCommunityIcons
                  name="food"
                  size={64}
                  color={colors.foreground}
                />

                <Text className="text-secondaryForeground text-center text-xl w-3/4">
                  Your calorie logs will appear here, showing the things you
                  have logged today.
                </Text>

                <Pressable
                  className="bg-secondary p-4 rounded-lg"
                  onPress={() => router.push("/(tabs)/log/calories")}
                >
                  <Text className="text-foreground">Log calories</Text>
                </Pressable>
              </View>
            )
          ) : workoutLogs.length > 0 ? (
            workoutLogs.map((workoutLog) => {
              const IconComponent = iconLibraries[workoutLog.iconLibrary];

              return (
                <View
                  className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border"
                  key={workoutLog.id}
                >
                  <IconComponent
                    name={workoutLog.iconName as any}
                    size={48}
                    color={colors.foreground}
                  />

                  <View className="flex-1 gap-2">
                    <Text className="text-lg font-bold text-foreground">
                      {workoutLog.name}
                    </Text>
                    <Text className="text-secondaryForeground">
                      {workoutLog.duration} minutes
                    </Text>
                  </View>

                  <Pressable onPress={() => editWorkoutLog(workoutLog)}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={24}
                      color={colors.foreground}
                    />
                  </Pressable>
                </View>
              );
            })
          ) : (
            <View className="gap-4 items-center p-4">
              <MaterialCommunityIcons
                name="run"
                size={64}
                color={colors.foreground}
              />

              <Text className="text-secondaryForeground text-center text-xl w-3/4">
                Your workout logs will appear here, showing the things you have
                logged today.
              </Text>

              <Pressable
                className="bg-secondary p-4 rounded-lg"
                onPress={() => router.push("/(tabs)/log/workout")}
              >
                <Text className="text-foreground">Log workout</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
