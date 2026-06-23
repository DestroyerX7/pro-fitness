import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useCalorieLogs from "@/hooks/useCalorieLogs";
import useGoals from "@/hooks/useGoals";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import useWorkoutLogs from "@/hooks/useWorkoutLogs";
import { CalorieLog, Goal, WorkoutLog } from "@/lib/api";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function History() {
  const { user: authUser } = useAuthenticatedAuth();
  const { data: user } = useUser(authUser.id);
  const { data: calorieLogs } = useCalorieLogs(authUser.id);
  const { data: workoutLogs } = useWorkoutLogs(authUser.id);
  const { data: goals } = useGoals(authUser.id);

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const theme = useTheme();

  if (
    user === undefined ||
    calorieLogs === undefined ||
    workoutLogs === undefined ||
    goals === undefined
  ) {
    return;
  }

  const dates: string[] = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });

  const calorieLogsGroupedByDate = calorieLogs.reduce<
    Record<string, { calorieLogs: CalorieLog[]; totalCalories: number }>
  >((dict, calorieLog) => {
    const date = calorieLog.consumedAt.toString().split("T")[0];

    if (!dict[date]) {
      dict[date] = {
        calorieLogs: [calorieLog],
        totalCalories: calorieLog.calories,
      };
    } else {
      dict[date].calorieLogs.push(calorieLog);
      dict[date].totalCalories += calorieLog.calories;
    }

    return dict;
  }, {});

  const workoutLogsGroupedByDate = workoutLogs.reduce<
    Record<string, { workoutLogs: WorkoutLog[]; totalDuration: number }>
  >((dict, workoutLog) => {
    const date = workoutLog.performedAt.toString().split("T")[0];

    if (!dict[date]) {
      dict[date] = {
        workoutLogs: [workoutLog],
        totalDuration: workoutLog.duration,
      };
    } else {
      dict[date].workoutLogs.push(workoutLog);
      dict[date].totalDuration += workoutLog.duration;
    }

    return dict;
  }, {});

  const goalsGroupedByCreatedAt = goals.reduce<Record<string, Goal[]>>(
    (dict, goal) => {
      const date = goal.createdAt.toString().split("T")[0];

      if (!dict[date]) {
        dict[date] = [goal];
      } else {
        dict[date].push(goal);
      }

      return dict;
    },
    {},
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4 gap-4"
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 flex-1"
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
          .map(([dateString, { calorieLogs, totalCalories }]) => (
            <View key={dateString} className="gap-4">
              <View className="flex-row justify-between">
                <ThemedText>
                  {/* {new Date(dateString).toLocaleDateString()} */}
                  {dateString}
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
                />
              ))}
            </View>
          ))}

      {activeTab === "workouts" &&
        Object.entries(workoutLogsGroupedByDate)
          .toReversed()
          .map(([dateString, { workoutLogs, totalDuration }]) => (
            <View key={dateString} className="gap-4">
              <View className="flex-row justify-between">
                <ThemedText>
                  {/* {new Date(dateString).toLocaleDateString()} */}
                  {dateString}
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
                />
              ))}
            </View>
          ))}

      {activeTab === "goals" &&
        Object.entries(goalsGroupedByCreatedAt)
          .toReversed()
          .map(([dateString, goals]) => (
            <View key={dateString} className="gap-4">
              <View className="flex-row justify-between">
                <ThemedText>
                  {/* {new Date(dateString).toLocaleDateString()} */}
                  {dateString}
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
                />
              ))}
            </View>
          ))}
    </ScrollView>
  );
}
