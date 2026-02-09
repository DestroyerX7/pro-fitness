import { useAuth } from "@/components/AuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import {
  CalorieLog,
  getCalorieLogs,
  getGoals,
  getUser,
  getWorkoutLogs,
  Goal,
  WorkoutLog,
} from "@/lib/api";
import { colors } from "@/lib/colors";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  const { data: authData } = useAuth();

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

  const { data: calorieLogs } = useQuery({
    queryKey: ["calorieLogs", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getCalorieLogs(userId);
    },
    enabled: authData !== null,
  });

  const { data: workoutLogs } = useQuery({
    queryKey: ["workoutLogs", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getWorkoutLogs(userId);
    },
    enabled: authData !== null,
  });

  const { data: goals } = useQuery({
    queryKey: ["goals", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getGoals(userId);
    },
    enabled: authData !== null,
  });

  if (
    user === undefined ||
    calorieLogs === undefined ||
    workoutLogs === undefined ||
    goals === undefined
  ) {
    return;
  }

  const DAYS = 31;

  const dates: string[] = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  });

  const calorieLogsGroupedByDate = calorieLogs.reduce<
    Record<string, { calorieLogs: CalorieLog[]; totalCalories: number }>
  >((dict, calorieLog) => {
    if (!dict[calorieLog.date]) {
      dict[calorieLog.date] = {
        calorieLogs: [calorieLog],
        totalCalories: calorieLog.calories,
      };
    } else {
      dict[calorieLog.date].calorieLogs.push(calorieLog);
      dict[calorieLog.date].totalCalories += calorieLog.calories;
    }

    return dict;
  }, {});

  const workoutLogsGroupedByDate = workoutLogs.reduce<
    Record<string, { workoutLogs: WorkoutLog[]; totalDuration: number }>
  >((dict, workoutLog) => {
    if (!dict[workoutLog.date]) {
      dict[workoutLog.date] = {
        workoutLogs: [workoutLog],
        totalDuration: workoutLog.duration,
      };
    } else {
      dict[workoutLog.date].workoutLogs.push(workoutLog);
      dict[workoutLog.date].totalDuration += workoutLog.duration;
    }

    return dict;
  }, {});

  const goalsGroupedByCreatedAt = goals.reduce<Record<string, Goal[]>>(
    (dict, goal) => {
      if (!dict[new Date(goal.createdAt).toLocaleDateString("en-CA")]) {
        dict[new Date(goal.createdAt).toLocaleDateString("en-CA")] = [goal];
      } else {
        dict[new Date(goal.createdAt).toLocaleDateString("en-CA")].push(goal);
      }

      return dict;
    },
    {},
  );

  return (
    <SafeAreaView edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <ThemedText className="text-4xl font-bold">History</ThemedText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, flex: 1 }}
        >
          <Pressable
            className="p-4 rounded-xl"
            style={{
              backgroundColor:
                activeTab === "calories" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("calories")}
          >
            <ThemedText
              color={
                activeTab === "calories"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Calories
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 bg-secondary rounded-xl"
            style={{
              backgroundColor:
                activeTab === "workouts" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("workouts")}
          >
            <ThemedText
              color={
                activeTab === "workouts"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Workouts
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 bg-secondary rounded-xl"
            style={{
              backgroundColor:
                activeTab === "goals" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("goals")}
          >
            <ThemedText
              color={
                activeTab === "goals"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Goals
            </ThemedText>
          </Pressable>
        </ScrollView>

        <View className="flex-row flex-wrap gap-4">
          {dates.map((date) => (
            <View
              key={date}
              className="w-16 h-16 rounded items-center justify-center"
              style={{
                backgroundColor:
                  (calorieLogsGroupedByDate[date]?.totalCalories || 0) >=
                  user.dailyCalorieGoal
                    ? "#30d030"
                    : theme.secondary,
              }}
            >
              <ThemedText>
                {(
                  ((calorieLogsGroupedByDate[date]?.totalCalories || 0) /
                    user.dailyCalorieGoal) *
                  100
                ).toFixed(0)}
                %
              </ThemedText>
            </View>
          ))}
        </View>

        {activeTab === "calories" &&
          Object.entries(calorieLogsGroupedByDate)
            .toReversed()
            .map(([date, { calorieLogs, totalCalories }]) => {
              const [year, month, day] = date.split("-").map(Number);

              return (
                <View key={date} className="gap-4">
                  <View className="flex-row justify-between">
                    <ThemedText>
                      {month}/{day}/{year}
                    </ThemedText>

                    <ThemedText>{totalCalories} calories</ThemedText>
                  </View>

                  {calorieLogs.map((calorieLog) => (
                    <CalorieLogItem
                      key={calorieLog.id}
                      id={calorieLog.id}
                      name={calorieLog.name}
                      calories={calorieLog.calories}
                      imageUrl={calorieLog.imageUrl}
                      colorScheme={colorScheme}
                    />
                  ))}
                </View>
              );
            })}

        {activeTab === "workouts" &&
          Object.entries(workoutLogsGroupedByDate)
            .toReversed()
            .map(([date, { workoutLogs, totalDuration }]) => {
              const [year, month, day] = date.split("-").map(Number);

              return (
                <View key={date} className="gap-4">
                  <View className="flex-row justify-between">
                    <ThemedText>
                      {month}/{day}/{year}
                    </ThemedText>

                    <ThemedText>{totalDuration} minutes</ThemedText>
                  </View>

                  {workoutLogs.map((workoutLog) => (
                    <WorkoutLogItem
                      key={workoutLog.id}
                      id={workoutLog.id}
                      name={workoutLog.name}
                      duration={workoutLog.duration}
                      iconLibrary={workoutLog.iconLibrary}
                      iconName={workoutLog.iconName}
                      colorScheme={colorScheme}
                    />
                  ))}
                </View>
              );
            })}

        {activeTab === "goals" &&
          Object.entries(goalsGroupedByCreatedAt)
            .toReversed()
            .map(([date, goals]) => {
              const [year, month, day] = date.split("-").map(Number);

              return (
                <View key={date} className="gap-4">
                  <View className="flex-row justify-between">
                    <ThemedText>
                      {month}/{day}/{year}
                    </ThemedText>

                    <ThemedText>{goals.length} created</ThemedText>
                  </View>

                  {goals.map((goal) => (
                    <GoalItem
                      key={goal.id}
                      id={goal.id}
                      name={goal.name}
                      description={goal.description}
                      completed={goal.completed}
                      colorScheme={colorScheme}
                    />
                  ))}
                </View>
              );
            })}
      </ScrollView>
    </SafeAreaView>
  );
}
