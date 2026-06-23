import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import Card from "@/components/Card";
import DailyGoalCard from "@/components/DailyGoalCard";
import GoalItem from "@/components/GoalItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useCalorieLogs from "@/hooks/useCalorieLogs";
import useGoals from "@/hooks/useGoals";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import useWorkoutLogs from "@/hooks/useWorkoutLogs";
import {
  updateCalorieGoal,
  updateGoalCompleted,
  updateGoalHidden,
  updateWorkoutGoal,
  User,
} from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

export default function Index() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthenticatedAuth();
  const { data: user } = useUser(authUser.id);
  const { data: calorieLogs } = useCalorieLogs(authUser.id);
  const { data: workoutLogs } = useWorkoutLogs(authUser.id);
  const { data: goals } = useGoals(authUser.id);

  const theme = useTheme();

  // const [editingWorkoutLog, setEditingWorkoutLog] = useState<WorkoutLog | null>(
  //   null,
  // );
  // const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const updateDailyCalorieGoalMutation = useMutation({
    mutationFn: updateCalorieGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authUser.id] });
    },
  });

  const updateDailyWorkoutGoalMutation = useMutation({
    mutationFn: updateWorkoutGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authUser.id] });
    },
  });

  // const updateWorkoutLogMutaion = useMutation({
  //   mutationFn: updateWorkoutLog,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["workoutLogs", authUser.id],
  //     });
  //   },
  // });

  // const deleteWorkoutLogMutation = useMutation({
  //   mutationFn: deleteWorkoutLog,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["workoutLogs", authUser.id],
  //     });
  //   },
  // });

  // const updateGoalMutation = useMutation({
  //   mutationFn: updateGoal,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
  //   },
  // });

  const updateGoalCompletedMutation = useMutation({
    mutationFn: updateGoalCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
    },
  });

  const updateGoalHiddenMutation = useMutation({
    mutationFn: updateGoalHidden,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
    },
  });

  // const deleteGoalMutation = useMutation({
  //   mutationFn: deleteGoal,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
  //   },
  // });

  const editDailyCalorieGoal = async (user: User) => {
    Alert.prompt(
      "Edit calorie goal",
      "Update your daily calorie goal",
      (calorieGoalText) =>
        updateDailyCalorieGoalMutation.mutate({
          calorieGoalText,
          userId: user.id,
        }),
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
      (workoutGoalText) =>
        updateDailyWorkoutGoalMutation.mutate({
          workoutGoalText,
          userId: user.id,
        }),
      "plain-text",
      user.dailyWorkoutGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const editCalorieLog = async (calorieLogId: string) => {
    router.push({
      pathname: "/edit/calorieLog/[id]",
      params: { id: calorieLogId },
    });

    await Haptics.selectionAsync();
  };

  const editWorkoutLog = async (workoutLogId: string) => {
    // const workoutLog = workoutLogs?.find((w) => w.id === workoutLogId);

    // if (workoutLog === undefined) {
    //   return;
    // }

    // setEditingWorkoutLog(workoutLog);
    await Haptics.selectionAsync();
  };

  const editGoal = async (goalId: string) => {
    // const workoutLog = workoutLogs?.find((w) => w.id === workoutLogId);

    // if (workoutLog === undefined) {
    //   return;
    // }

    // setEditingWorkoutLog(workoutLog);
    await Haptics.selectionAsync();
  };

  // const saveWorkoutLog = async (editedWorkoutLog: WorkoutLog) => {
  //   if (editedWorkoutLog === editingWorkoutLog) {
  //     return;
  //   }

  //   updateWorkoutLogMutaion.mutate({ workoutLog: editedWorkoutLog });
  //   setEditingWorkoutLog(null);
  // };

  // const saveGoal = async (editedGoal: Goal) => {
  //   if (editedGoal === editingGoal) {
  //     return;
  //   }

  //   updateGoalMutation.mutate({ goal: editedGoal });
  //   setEditingGoal(null);
  // };

  // const handleDeleteWorkoutLog = async (workoutLogId: string) => {
  //   deleteWorkoutLogMutation.mutate(workoutLogId);
  //   setEditingWorkoutLog(null);
  // };

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalCompletedMutation.mutate({ completed, goalId });
  };

  const handleUpdateGoalHidden = (hidden: boolean, goalId: string) => {
    updateGoalHiddenMutation.mutate({ hidden, goalId });
  };

  // const handleDeleteGoal = (goalId: string) => {
  //   deleteGoalMutation.mutate({ goalId });
  //   setEditingGoal(null);
  // };

  if (
    user === undefined ||
    calorieLogs === undefined ||
    workoutLogs === undefined ||
    goals === undefined
  ) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4"
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-4">
          <View className="flex-row justify-between">
            <ThemedText className="text-2xl font-bold">
              Today&apos;s Calories
            </ThemedText>

            <View>
              <MaterialIcons
                name="mode-edit"
                size={24}
                color={theme.foreground}
              />
            </View>
          </View>

          <View className="h-8 w-1/4 bg-border rounded-md" />

          <View className="h-8 bg-border rounded-full" />

          <View className="flex-row justify-between">
            <View className="h-8 bg-border w-1/2 rounded-md" />

            <View className="h-8 bg-border w-1/4 rounded-md" />
          </View>
        </Card>

        <Card className="gap-4">
          <View className="flex-row justify-between">
            <ThemedText className="text-2xl font-bold">Workout Time</ThemedText>

            <View>
              <MaterialIcons
                name="mode-edit"
                size={24}
                color={theme.foreground}
              />
            </View>
          </View>

          <View className="h-8 w-1/4 bg-border rounded-md" />

          <View className="h-8 bg-border rounded-full" />

          <View className="flex-row justify-between">
            <View className="h-8 bg-border w-1/2 rounded-md" />

            <View className="h-8 bg-border w-1/4 rounded-md" />
          </View>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 flex-1"
        >
          <TabButton text="Calories" active={activeTab === "calories"} />

          <TabButton text="Workouts" active={activeTab === "workouts"} />

          <TabButton text="Goals" active={activeTab === "goals"} />
        </ScrollView>

        <View className="gap-4 items-center p-4">
          <MaterialCommunityIcons
            name="food"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-center text-xl w-3/4">
            Loading calorie logs...
          </ThemedText>
        </View>
      </ScrollView>
    );
  }

  const todayString = toSqlTimestamp(new Date()).slice(0, 10);

  const todaysCalorieLogs = calorieLogs
    .filter((c) => c.consumedAt.slice(0, 10) === todayString)
    .sort((a, b) => a.consumedAt.localeCompare(b.consumedAt));

  const todaysWorkoutLogs = workoutLogs
    .filter((w) => w.performedAt.slice(0, 10) === todayString)
    .sort((a, b) => a.performedAt.localeCompare(b.performedAt));

  const loggedCalories = todaysCalorieLogs.reduce((a, b) => a + b.calories, 0);
  const loggedWorkoutTime = todaysWorkoutLogs.reduce(
    (a, b) => a + b.duration,
    0,
  );
  const goalsVisable = goals.filter((g) => !g.hidden);
  const goalsCompleted = goalsVisable.filter((g) => g.completed).length;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}
    >
      {/* {editingWorkoutLog !== null && (
        <EditWorkoutLogModal
          workoutLog={editingWorkoutLog}
          close={() => setEditingWorkoutLog(null)}
          onSave={saveWorkoutLog}
          onDelete={handleDeleteWorkoutLog}
        />
      )} */}

      {/* {editingGoal !== null && (
        <EditGoalModal
          goal={editingGoal}
          close={() => setEditingGoal(null)}
          onSave={saveGoal}
          onDelete={handleDeleteGoal}
        />
      )} */}

      <DailyGoalCard
        title="Today's Calories"
        completedAmount={loggedCalories}
        goalAmount={user.dailyCalorieGoal}
        remainingText="calories"
        topRight={
          <Pressable onPress={() => editDailyCalorieGoal(user)}>
            <MaterialIcons
              name="mode-edit"
              size={24}
              color={theme.foreground}
            />
          </Pressable>
        }
      />

      <DailyGoalCard
        title="Workout Time"
        completedAmount={loggedWorkoutTime}
        goalAmount={user.dailyWorkoutGoal}
        remainingText="minutes"
        fillColor={theme.primary}
        topRight={
          <Pressable onPress={() => editDailyWorkoutGoal(user)}>
            <MaterialIcons
              name="mode-edit"
              size={24}
              color={theme.foreground}
            />
          </Pressable>
        }
      />

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

        <TabButton
          text="Goals"
          active={activeTab === "goals"}
          onPress={() => setActiveTab("goals")}
        />
      </ScrollView>

      {activeTab === "calories" &&
        (todaysCalorieLogs.length > 0 ? (
          todaysCalorieLogs.map((calorieLog) => (
            <CalorieLogItem
              key={calorieLog.id}
              id={calorieLog.id}
              name={calorieLog.name}
              calories={calorieLog.calories}
              imageUrl={calorieLog.imageUrl}
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
                  onEdit={editGoal}
                />
              </Pressable>
            ))}
          </>
        ) : (
          <View className="gap-4 items-center p-4">
            <MaterialCommunityIcons
              name="bullseye-arrow"
              size={64}
              color={theme.foreground}
            />

            <ThemedText className="text-center text-xl w-3/4">
              Your goals will appear here, showing the things that are visible.
            </ThemedText>

            <Pressable
              className="bg-secondary p-4 rounded-xl"
              onPress={() => router.push("/(tabs)/log/goal")}
            >
              <ThemedText color="text-secondary-foreground">
                Create Goal
              </ThemedText>
            </Pressable>
          </View>
        ))}
    </ScrollView>
  );
}
