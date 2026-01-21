import { useAuth } from "@/components/AuthProvider";
import Card from "@/components/Card";
import EditCalorieLogModal from "@/components/EditCalorieLogModal";
import EditWorkoutLogModal from "@/components/EditWorkoutLogModal";
import ThemedText from "@/components/ThemedText";
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
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
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

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

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
    <SafeAreaView className="flex-1" edges={["top"]}>
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

      <ThemedText className="text-4xl font-bold pt-4 px-4">Home</ThemedText>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-4">
          <View className="flex-row justify-between">
            <ThemedText className="text-2xl font-bold">
              Today's Calories
            </ThemedText>

            <Pressable onPress={() => editDailyCalorieGoal(user)}>
              <MaterialIcons
                name="mode-edit"
                size={24}
                color={theme.foreground}
              />
            </Pressable>
          </View>

          <ThemedText>
            <ThemedText className="text-4xl font-bold">
              {loggedCalories}
            </ThemedText>{" "}
            / {user.dailyCalorieGoal}
          </ThemedText>

          <View className="h-8 bg-muted rounded-full">
            <View
              className="h-full bg-[#30d030] rounded-full"
              style={{
                width: `${Math.min((loggedCalories / user.dailyCalorieGoal) * 100, 100)}%`,
              }}
            />
          </View>

          <View className="flex-row justify-between">
            <ThemedText>
              {Math.max(user.dailyCalorieGoal - loggedCalories, 0)} calories
              remaining
            </ThemedText>

            <ThemedText>
              {((loggedCalories / user.dailyCalorieGoal) * 100).toFixed(2)}%
            </ThemedText>
          </View>
        </Card>

        <Card className="gap-4">
          <View className="flex-row justify-between">
            <ThemedText className="text-2xl font-bold">Workout Time</ThemedText>

            <Pressable onPress={() => editDailyWorkoutGoal(user)}>
              <MaterialIcons
                name="mode-edit"
                size={24}
                color={theme.foreground}
              />
            </Pressable>
          </View>

          <ThemedText>
            <ThemedText className="text-4xl font-bold">
              {loggedWorkoutTime}
            </ThemedText>{" "}
            / {user.dailyWorkoutGoal}
          </ThemedText>

          <View className="h-8 bg-muted rounded-full">
            <View
              className="h-full bg-primary rounded-full"
              style={{
                width: `${Math.min((loggedWorkoutTime / user.dailyWorkoutGoal) * 100, 100)}%`,
              }}
            />
          </View>

          <View className="flex-row justify-between">
            <ThemedText>
              {Math.max(user.dailyWorkoutGoal - loggedWorkoutTime, 0)} mins
              remaining
            </ThemedText>

            <ThemedText>
              {((loggedWorkoutTime / user.dailyWorkoutGoal) * 100).toFixed(2)}%
            </ThemedText>
          </View>
        </Card>

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
          calorieLogs.length > 0 ? (
            calorieLogs.map((calorieLog) => (
              <Card className="flex-row gap-4" key={calorieLog.id}>
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
                      color={theme.foreground}
                    />
                  </View>
                )}

                <View className="flex-1 gap-1">
                  <ThemedText className="text-lg font-bold">
                    {calorieLog.name}
                  </ThemedText>

                  <ThemedText variant="muted-foreground">
                    {calorieLog.calories}
                  </ThemedText>
                </View>

                <Pressable onPress={() => editCalorieLog(calorieLog)}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={24}
                    color={theme.foreground}
                  />
                </Pressable>
              </Card>
            ))
          ) : (
            <View className="gap-4 items-center p-4">
              <MaterialCommunityIcons
                name="food"
                size={64}
                color={theme.foreground}
              />

              <ThemedText className="text-center text-xl w-3/4">
                Your calorie logs will appear here, showing the things you have
                logged today.
              </ThemedText>

              <Pressable
                className="bg-secondary p-4 rounded-lg"
                onPress={() => router.push("/(tabs)/log/calories")}
              >
                <ThemedText variant="secondary-foreground">
                  Log calories
                </ThemedText>
              </Pressable>
            </View>
          )
        ) : workoutLogs.length > 0 ? (
          workoutLogs.map((workoutLog) => {
            const IconComponent = iconLibraries[workoutLog.iconLibrary];

            return (
              <Card className="flex-row gap-4" key={workoutLog.id}>
                <IconComponent
                  name={workoutLog.iconName as any}
                  size={48}
                  color={theme.foreground}
                />

                <View className="flex-1 gap-1">
                  <ThemedText className="text-lg font-bold">
                    {workoutLog.name}
                  </ThemedText>

                  <ThemedText variant="muted-foreground">
                    {workoutLog.duration} minutes
                  </ThemedText>
                </View>

                <Pressable onPress={() => editWorkoutLog(workoutLog)}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={24}
                    color={theme.foreground}
                  />
                </Pressable>
              </Card>
            );
          })
        ) : (
          <View className="gap-4 items-center p-4">
            <MaterialCommunityIcons
              name="run"
              size={64}
              color={theme.foreground}
            />

            <ThemedText className="text-center text-xl w-3/4">
              Your workout logs will appear here, showing the things you have
              logged today.
            </ThemedText>

            <Pressable
              className="bg-secondary p-4 rounded-lg"
              onPress={() => router.push("/(tabs)/log/workout")}
            >
              <ThemedText variant="secondary-foreground">
                Log workout
              </ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
