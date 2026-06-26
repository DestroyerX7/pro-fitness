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
import { updateGoal, updateUser, User } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function Index() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthenticatedAuth();
  const {
    data: user,
    refetch: refetchUser,
    isFetching: isFetchingUser,
  } = useUser(authUser.id);
  const {
    data: calorieLogs,
    refetch: refetchCalorieLogs,
    isFetching: isFetchingCalorieLogs,
  } = useCalorieLogs(authUser.id);
  const {
    data: workoutLogs,
    refetch: refetchWorkoutLogs,
    isFetching: isFetchingWorkoutLogs,
  } = useWorkoutLogs(authUser.id);
  const {
    data: goals,
    refetch: refetchGoals,
    isFetching: isFetchingGoals,
  } = useGoals(authUser.id);

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const theme = useTheme();

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authUser.id] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
    },
  });

  const handleEditDailyCalorieGoal = async (user: User) => {
    Alert.prompt(
      "Edit calorie goal",
      "Update your daily calorie goal",
      (calorieGoalText) =>
        updateUserMutation.mutate({
          dailyCalorieGoal: Number(calorieGoalText),
          userId: user.id,
        }),
      "plain-text",
      user.dailyCalorieGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const handleEditDailyWorkoutGoal = async (user: User) => {
    Alert.prompt(
      "Edit workout goal",
      "Update your daily workout goal",
      (workoutGoalText) =>
        updateUserMutation.mutate({
          dailyWorkoutGoal: Number(workoutGoalText),
          userId: user.id,
        }),
      "plain-text",
      user.dailyWorkoutGoal.toString(),
      "number-pad",
    );

    await Haptics.selectionAsync();
  };

  const handleEditCalorieLog = async (calorieLogId: string) => {
    router.push({
      pathname: "/edit/calorie-log/[calorieLogId]",
      params: { calorieLogId },
    });

    await Haptics.selectionAsync();
  };

  const handleEditWorkoutLog = async (workoutLogId: string) => {
    router.push({
      pathname: "/edit/workout-log/[workoutLogId]",
      params: { workoutLogId },
    });

    await Haptics.selectionAsync();
  };

  const handleEditGoal = async (goalId: string) => {
    router.push({
      pathname: "/edit/goal/[goalId]",
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
    .sort((a, b) => b.consumedAt.localeCompare(a.consumedAt));

  const todaysWorkoutLogs = workoutLogs
    .filter((w) => w.performedAt.slice(0, 10) === todayString)
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));

  const loggedCalories = todaysCalorieLogs.reduce((a, b) => a + b.calories, 0);
  const loggedWorkoutTime = todaysWorkoutLogs.reduce(
    (a, b) => a + b.duration,
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
        <RefreshControl
          refreshing={
            isFetchingUser ||
            isFetchingCalorieLogs ||
            isFetchingWorkoutLogs ||
            isFetchingGoals
          }
          onRefresh={() => {
            refetchUser();
            refetchCalorieLogs();
            refetchWorkoutLogs();
            refetchGoals();
          }}
        />
      }
    >
      <DailyGoalCard
        title="Today's Calories"
        completedAmount={loggedCalories}
        goalAmount={user.dailyCalorieGoal}
        remainingText="calories"
        topRight={
          <Pressable onPress={() => handleEditDailyCalorieGoal(user)}>
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
          <Pressable onPress={() => handleEditDailyWorkoutGoal(user)}>
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
              onEdit={handleEditCalorieLog}
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
