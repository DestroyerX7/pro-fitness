import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import Card from "@/components/Card";
import DailyGoalCard from "@/components/DailyTargetCard";
import GoalItem from "@/components/GoalItem";
import NutritionLogItem from "@/components/NutritionLogItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import { queryKeys } from "@/constants/query-keys";
import useDailyTarget from "@/hooks/useDailyTarget";
import useGoals from "@/hooks/useGoals";
import useNutritionLogs from "@/hooks/useNutritionLogs";
import useTheme from "@/hooks/useTheme";
import useWorkoutLogs from "@/hooks/useWorkoutLogs";
import { Goal, updateDailyTarget, updateGoal } from "@/lib/api";
import { toSqlDate } from "@/lib/dates";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function Index() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();
  const {
    data: dailyTarget,
    refetch: refetchDailyTarget,
    isPending: isPendingDailyTarget,
    error: dailyTargetError,
  } = useDailyTarget(user.id);
  const {
    data: nutritionLogs,
    refetch: refetchNutritionLogs,
    isPending: isPendingNutritionLogs,
    error: nutritionLogsError,
  } = useNutritionLogs(user.id);
  const {
    data: workoutLogs,
    refetch: refetchWorkoutLogs,
    isPending: isPendingWorkoutLogs,
    error: workoutLogsError,
  } = useWorkoutLogs(user.id);
  const {
    data: goals,
    refetch: refetchGoals,
    isPending: isPendingGoals,
    error: goalsError,
  } = useGoals(user.id);

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const theme = useTheme();

  const updateDailyTargetMutation = useMutation({
    mutationFn: updateDailyTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyTarget.byUser(user.id),
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onMutate: async (variables) => {
      // Stop any in-flight refetches so they don't clobber our optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.goals.all(user.id),
      });

      // Snapshot the current cache so we can roll back on error
      const previousGoals = queryClient.getQueryData<Goal[]>(
        queryKeys.goals.all(user.id),
      );

      // Optimistically write the new value into the cache
      queryClient.setQueryData<Goal[]>(queryKeys.goals.all(user.id), (old) =>
        old?.map((goal) =>
          goal.id === variables.goalId ? { ...goal, ...variables } : goal,
        ),
      );

      // Pass the snapshot forward so onError can use it
      return { previousGoals };
    },
    onError: (_error, _variables, context) => {
      // Roll back to the pre-mutation state
      if (context !== undefined && context.previousGoals !== undefined) {
        queryClient.setQueryData(
          queryKeys.goals.all(user.id),
          context.previousGoals,
        );
      }
    },
    onSettled: () => {
      // Always resync with the server afterward, success or failure
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all(user.id) });
    },
  });

  const handleEditDailyCalorieTarget = async () => {
    if (dailyTarget === undefined) {
      return;
    }

    Alert.prompt(
      "Edit calorie target",
      "Update your daily calorie target",
      (calorieTargetText) =>
        updateDailyTargetMutation.mutate({
          calorieTarget: Number(calorieTargetText),
        }),
      "plain-text",
      dailyTarget.calorieTarget.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const handleEditDailyWorkoutMinutesTarget = async () => {
    if (dailyTarget === undefined) {
      return;
    }

    Alert.prompt(
      "Edit workout target",
      "Update your daily workout target",
      (workoutMinutesTargetText) =>
        updateDailyTargetMutation.mutate({
          workoutMinutesTarget: Number(workoutMinutesTargetText),
        }),
      "plain-text",
      dailyTarget.workoutMinutesTarget.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const handleEditNutritionLog = async (nutritionLogId: string) => {
    router.push({
      pathname: "/(protected)/edit/nutrition-log/nutritionLogId]",
      params: { nutritionLogId },
    });

    await Haptics.selectionAsync();
  };

  const handleEditWorkoutLog = async (workoutLogId: string) => {
    router.push({
      pathname: "/(protected)/edit/workout-log/[workoutLogId]",
      params: { workoutLogId },
    });

    await Haptics.selectionAsync();
  };

  const handleEditGoal = async (goalId: string) => {
    router.push({
      pathname: "/(protected)/edit/goal/[goalId]",
      params: { goalId },
    });

    await Haptics.selectionAsync();
  };

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalMutation.mutate({ completed, goalId });
  };

  const handleUpdateGoalHidden = (hidden: boolean, goalId: string) => {
    updateGoalMutation.mutate({ hidden, goalId });
  };

  const handleRefresh = async () => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      await Promise.allSettled([
        refetchDailyTarget(),
        refetchNutritionLogs(),
        refetchWorkoutLogs(),
        refetchGoals(),
      ]);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  };

  if (
    dailyTargetError !== null ||
    nutritionLogsError !== null ||
    workoutLogsError !== null ||
    goalsError !== null
  ) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="gap-4 items-center justify-center flex-1 p-4">
          <MaterialIcons
            name="error-outline"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-center text-xl w-3/4">
            Something went wrong loading your data.
          </ThemedText>

          <Pressable
            className="bg-secondary p-4 rounded-xl"
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <ThemedText className="text-secondary-foreground">
              {isRefreshing ? "Retrying..." : "Try again"}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (
    isPendingDailyTarget ||
    isPendingNutritionLogs ||
    isPendingWorkoutLogs ||
    isPendingGoals
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

  const todayString = toSqlDate(new Date());

  const todaysNutritionLogs = nutritionLogs.filter(
    (c) => toSqlDate(c.consumedAt) === todayString,
  );

  const todaysWorkoutLogs = workoutLogs.filter(
    (w) => toSqlDate(w.performedAt) === todayString,
  );

  const loggedCalories = todaysNutritionLogs.reduce(
    (a, b) => a + b.calories,
    0,
  );
  const loggedWorkoutTime = todaysWorkoutLogs.reduce(
    (a, b) => a + b.durationMinutes,
    0,
  );
  const goalsVisable = goals.filter((g) => !g.hidden);
  const numGoalsCompleted = goalsVisable.filter((g) => g.completed).length;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <DailyGoalCard
        title="Today's Calories"
        completedAmount={loggedCalories}
        targetAmount={dailyTarget.calorieTarget}
        remainingText="calories"
        topRight={
          <Pressable onPress={handleEditDailyCalorieTarget}>
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
        targetAmount={dailyTarget.workoutMinutesTarget}
        remainingText="minutes"
        fillColor={theme.primary}
        topRight={
          <Pressable onPress={handleEditDailyWorkoutMinutesTarget}>
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
        (todaysNutritionLogs.length > 0 ? (
          todaysNutritionLogs.map((nutritionLog) => (
            <NutritionLogItem
              key={nutritionLog.id}
              id={nutritionLog.id}
              name={nutritionLog.name}
              calories={nutritionLog.calories}
              imageUrl={nutritionLog.imageUrl}
              onEdit={handleEditNutritionLog}
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
              className="bg-secondary p-4 rounded-xl active:opacity-80"
              onPress={() => router.push("/(protected)/(tabs)/log/nutrition")}
            >
              <ThemedText className="text-secondary-foreground">
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
              durationMinutes={workoutLog.durationMinutes}
              workoutLogIcon={workoutLog.icon}
              onEdit={handleEditWorkoutLog}
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
              className="bg-secondary p-4 rounded-xl active:opacity-80"
              onPress={() => router.push("/(protected)/(tabs)/log/workout")}
            >
              <ThemedText className="text-secondary-foreground">
                Log workout
              </ThemedText>
            </Pressable>
          </View>
        ))}

      {activeTab === "goals" &&
        (goalsVisable.length > 0 ? (
          <>
            <ThemedText className="text-2xl font-bold">
              ({numGoalsCompleted}/{goalsVisable.length}) Completed
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
                  onEdit={handleEditGoal}
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
              className="bg-secondary p-4 rounded-xl active:opacity-80"
              onPress={() => router.push("/(protected)/(tabs)/log/goal")}
            >
              <ThemedText className="text-secondary-foreground">
                Create Goal
              </ThemedText>
            </Pressable>
          </View>
        ))}
    </ScrollView>
  );
}
