import { useAuth } from "@/components/AuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import Card from "@/components/Card";
import EditCalorieLogModal from "@/components/EditCalorieLogModal";
import EditWorkoutLogModal from "@/components/EditWorkoutLogModal";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import {
  CalorieLog,
  deleteCalorieLog,
  deleteWorkoutLog,
  getCalorieLogs,
  getGoals,
  getUser,
  getWorkoutLogs,
  updateCalorieGoal,
  updateCalorieLog,
  updateGoalCompleted,
  updateGoalHidden,
  updateWorkoutGoal,
  updateWorkoutLog,
  User,
  WorkoutLog,
} from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const [editingCalorieLog, setEditingCalorieLog] = useState<CalorieLog | null>(
    null,
  );
  const [editingWorkoutLog, setEditingWorkoutLog] = useState<WorkoutLog | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const { data: user } = useQuery({
    queryKey: ["user", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getUser(userId);
    },
    enabled: authData !== null,
  });

  const updateDailyCalorieGoalMutation = useMutation({
    mutationFn: updateCalorieGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authData?.user.id] });
    },
  });

  const updateDailyWorkoutGoalMutation = useMutation({
    mutationFn: updateWorkoutGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authData?.user.id] });
    },
  });

  const { data: calorieLogs } = useQuery({
    queryKey: ["calorieLogs", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getCalorieLogs(userId);
    },
    enabled: authData !== null,
  });

  const updateCalorieLogMutaion = useMutation({
    mutationFn: updateCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const deleteCalorieLogMutation = useMutation({
    mutationFn: deleteCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const { data: workoutLogs } = useQuery({
    queryKey: ["workoutLogs", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getWorkoutLogs(userId);
    },
    enabled: authData !== null,
  });

  const updateWorkoutLogMutaion = useMutation({
    mutationFn: updateWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", authData?.user.id],
      });
    },
  });

  const deleteWorkoutLogMutation = useMutation({
    mutationFn: deleteWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", authData?.user.id],
      });
    },
  });

  const { data: goals } = useQuery({
    queryKey: ["goals", authData?.user.id || ""],
    queryFn: async ({ queryKey }) => {
      const [, userId] = queryKey;
      return getGoals(userId);
    },
    enabled: authData !== null,
  });

  const updateGoalCompletedMutation = useMutation({
    mutationFn: updateGoalCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });
    },
  });

  const updateGoalHiddenMutation = useMutation({
    mutationFn: updateGoalHidden,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });
    },
  });

  const editDailyCalorieGoal = async (user: User) => {
    if (authData == null) {
      return;
    }

    Alert.prompt(
      "Edit calorie goal",
      "Update your daily calorie goal",
      (calorieGoalText) =>
        updateDailyCalorieGoalMutation.mutate({
          calorieGoalText,
          userId: authData.user.id,
        }),
      "plain-text",
      user.dailyCalorieGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const editDailyWorkoutGoal = async (user: User) => {
    if (authData == null) {
      return;
    }

    Alert.prompt(
      "Edit workout goal",
      "Update your daily workout goal",
      async (workoutGoalText) =>
        updateDailyWorkoutGoalMutation.mutate({
          workoutGoalText,
          userId: authData.user.id,
        }),
      "plain-text",
      user.dailyWorkoutGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const editCalorieLog = async (calorieLogId: string) => {
    const calorieLog = calorieLogs?.find((c) => c.id === calorieLogId);

    if (calorieLog === undefined) {
      return;
    }

    setEditingCalorieLog(calorieLog);
    await Haptics.selectionAsync();
  };

  const editWorkoutLog = async (workoutLogId: string) => {
    const workoutLog = workoutLogs?.find((w) => w.id === workoutLogId);

    if (workoutLog === undefined) {
      return;
    }

    setEditingWorkoutLog(workoutLog);
    await Haptics.selectionAsync();
  };

  const saveCalorieLog = async (editedCalorieLog: CalorieLog) => {
    if (editedCalorieLog === editingCalorieLog) {
      return;
    }

    updateCalorieLogMutaion.mutate({ calorieLog: editedCalorieLog });
    setEditingCalorieLog(null);
  };

  const saveWorkoutLog = async (editedWorkoutLog: WorkoutLog) => {
    if (editedWorkoutLog === editingWorkoutLog) {
      return;
    }

    updateWorkoutLogMutaion.mutate({ workoutLog: editedWorkoutLog });
    setEditingWorkoutLog(null);
  };

  const handledeleteCalorieLog = async (calorieLogId: string) => {
    deleteCalorieLogMutation.mutate(calorieLogId);
    setEditingCalorieLog(null);
  };

  const handleDeleteWorkoutLog = async (workoutLogId: string) => {
    deleteWorkoutLogMutation.mutate(workoutLogId);
    setEditingWorkoutLog(null);
  };

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalCompletedMutation.mutate({ completed, goalId });
  };

  const handleUpdateGoalHidden = (hidden: boolean, goalId: string) => {
    updateGoalHiddenMutation.mutate({ hidden, goalId });
  };

  if (
    user === undefined ||
    calorieLogs === undefined ||
    workoutLogs === undefined ||
    goals === undefined
  ) {
    return;
  }

  const todaysCalorieLogs = calorieLogs
    .filter((c) => {
      const [year, month, day] = c.date.split("-").map(Number);
      return (
        new Date(year, month - 1, day).toDateString() ==
        new Date().toDateString()
      );
    })
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const todaysWorkoutLogs = workoutLogs
    .filter((w) => {
      const [year, month, day] = w.date.split("-").map(Number);
      new Date(year, month - 1, day).toDateString() ==
        new Date().toDateString();
    })
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const loggedCalories = todaysCalorieLogs.reduce((a, b) => a + b.calories, 0);
  const loggedWorkoutTime = todaysWorkoutLogs.reduce(
    (a, b) => a + b.duration,
    0,
  );
  const goalsVisable = goals.filter((g) => !g.hidden);
  const goalsCompleted = goalsVisable.filter((g) => g.completed).length;

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      {editingCalorieLog !== null && (
        <EditCalorieLogModal
          calorieLog={editingCalorieLog}
          close={() => setEditingCalorieLog(null)}
          onSave={saveCalorieLog}
          onDelete={handledeleteCalorieLog}
        />
      )}

      {editingWorkoutLog !== null && (
        <EditWorkoutLogModal
          workoutLog={editingWorkoutLog}
          close={() => setEditingWorkoutLog(null)}
          onSave={saveWorkoutLog}
          onDelete={handleDeleteWorkoutLog}
        />
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText className="text-4xl font-bold">Home</ThemedText>

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

          <View className="h-8 bg-border rounded-full">
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

          <View className="h-8 bg-border rounded-full">
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

          <Pressable
            className={`border-b-2 ${
              activeTab === "goals" ? "border-foreground" : "border-transparent"
            }`}
            onPress={() => setActiveTab("goals")}
          >
            <ThemedText
              className={`text-2xl ${activeTab === "goals" ? "font-bold" : ""}`}
            >
              Goals
            </ThemedText>
          </Pressable>
        </View>

        {activeTab === "calories" &&
          (todaysCalorieLogs.length > 0 ? (
            todaysCalorieLogs.map((calorieLog) => (
              <CalorieLogItem
                key={calorieLog.id}
                id={calorieLog.id}
                name={calorieLog.name}
                calories={calorieLog.calories}
                imageUrl={calorieLog.imageUrl}
                colorScheme={colorScheme}
                onEdit={editCalorieLog}
              />
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
                className="bg-secondary p-4 rounded-xl"
                onPress={() => router.push("/(tabs)/log/calories")}
              >
                <ThemedText color="text-secondary-foreground">
                  Log calories
                </ThemedText>
              </Pressable>
            </View>
          ))}

        {activeTab === "workouts" &&
          (todaysWorkoutLogs.length > 0 ? (
            todaysWorkoutLogs.map((workoutLog) => (
              <WorkoutLogItem
                key={workoutLog.id}
                id={workoutLog.id}
                name={workoutLog.name}
                duration={workoutLog.duration}
                colorScheme={colorScheme}
                iconLibrary={workoutLog.iconLibrary}
                iconName={workoutLog.iconName}
                onEdit={editWorkoutLog}
              />
            ))
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
                className="bg-secondary p-4 rounded-xl"
                onPress={() => router.push("/(tabs)/log/workout")}
              >
                <ThemedText color="text-secondary-foreground">
                  Log workout
                </ThemedText>
              </Pressable>
            </View>
          ))}

        {activeTab === "goals" &&
          (goalsVisable.length > 0 ? (
            <>
              <ThemedText className="text-2xl font-bold">
                ({goalsCompleted}/{goalsVisable.length}) Completed
              </ThemedText>

              {goalsVisable.map((goal) => (
                <Pressable
                  key={goal.id}
                  onPress={() =>
                    handleUpdateGoalCompleted(!goal.completed, goal.id)
                  }
                  onLongPress={() =>
                    handleUpdateGoalHidden(!goal.hidden, goal.id)
                  }
                >
                  <GoalItem
                    id={goal.id}
                    name={goal.name}
                    description={goal.description}
                    completed={goal.completed}
                    colorScheme={colorScheme}
                  />
                </Pressable>
              ))}
            </>
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
                className="bg-secondary p-4 rounded-xl"
                onPress={() => router.push("/(tabs)/log/workout")}
              >
                <ThemedText color="text-secondary-foreground">
                  Log workout
                </ThemedText>
              </Pressable>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
