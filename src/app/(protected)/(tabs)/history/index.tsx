import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import GoalItem from "@/components/GoalItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useCalorieLogs from "@/hooks/useCalorieLogs";
import useGoals from "@/hooks/useGoals";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import useWorkoutLogs from "@/hooks/useWorkoutLogs";
import { CalorieLog, Goal, WorkoutLog } from "@/lib/api";
import { toSqlDate } from "@/lib/dates";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const startedColor = "#004000";
const halfwayColor = "#108010";
const completedColor = "#20b020";

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

  const dateStrings = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return toSqlDate(date);
  });

  const calorieLogsGroupedByDate = calorieLogs.reduce<
    Record<string, { calorieLogs: CalorieLog[]; totalCalories: number }>
  >((dict, calorieLog) => {
    const dateString = calorieLog.consumedAt.slice(0, 10);

    if (dict[dateString] === undefined) {
      dict[dateString] = {
        calorieLogs: [],
        totalCalories: 0,
      };
    }

    dict[dateString].calorieLogs.push(calorieLog);
    dict[dateString].totalCalories += calorieLog.calories;

    return dict;
  }, {});

  const workoutLogsGroupedByDate = workoutLogs.reduce<
    Record<string, { workoutLogs: WorkoutLog[]; totalDuration: number }>
  >((dict, workoutLog) => {
    const dateString = workoutLog.performedAt.slice(0, 10);

    if (dict[dateString] === undefined) {
      dict[dateString] = {
        workoutLogs: [],
        totalDuration: 0,
      };
    }

    dict[dateString].workoutLogs.push(workoutLog);
    dict[dateString].totalDuration += workoutLog.duration;

    return dict;
  }, {});

  const goalsGroupedByCreatedAt = goals.reduce<Record<string, Goal[]>>(
    (dict, goal) => {
      const dateString = goal.createdAt.toString().split("T")[0];

      if (dict[dateString] === undefined) {
        dict[dateString] = [];
      }

      dict[dateString].push(goal);

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

      <View className="flex-row flex-wrap">
        {dateStrings.map((dateString) => {
          const totalCalories =
            calorieLogsGroupedByDate[dateString]?.totalCalories ?? 0;
          const backgroundColor =
            totalCalories >= user.dailyCalorieGoal
              ? completedColor
              : totalCalories >= user.dailyCalorieGoal * 0.5
                ? halfwayColor
                : totalCalories > 0
                  ? startedColor
                  : theme.secondary;

          const percentComplete = (
            (totalCalories / user.dailyCalorieGoal) *
            100
          ).toFixed(0);

          return (
            <View key={dateString} className="w-[16.66%] aspect-square p-1">
              <View
                className="flex-1 rounded items-center justify-center"
                style={{
                  backgroundColor,
                }}
              >
                <ThemedText>{percentComplete}%</ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {activeTab === "calories" &&
        Object.entries(calorieLogsGroupedByDate).map(
          ([dateString, { calorieLogs, totalCalories }]) => {
            const [year, month, day] = dateString.split("-").map(Number);
            const localeDateString = new Date(
              year,
              month - 1,
              day,
            ).toLocaleDateString();

            return (
              <View key={dateString} className="gap-4">
                <View className="flex-row justify-between">
                  <ThemedText>{localeDateString}</ThemedText>

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
            );
          },
        )}

      {activeTab === "workouts" &&
        Object.entries(workoutLogsGroupedByDate).map(
          ([dateString, { workoutLogs, totalDuration }]) => {
            const [year, month, day] = dateString.split("-").map(Number);
            const localeDateString = new Date(
              year,
              month - 1,
              day,
            ).toLocaleDateString();

            return (
              <View key={dateString} className="gap-4">
                <View className="flex-row justify-between">
                  <ThemedText>{localeDateString}</ThemedText>

                  <ThemedText>{totalDuration} minutes</ThemedText>
                </View>

                {workoutLogs.map((workoutLog) => (
                  <WorkoutLogItem
                    key={workoutLog.id}
                    id={workoutLog.id}
                    name={workoutLog.name}
                    duration={workoutLog.duration}
                    workoutLogIcon={workoutLog.icon}
                  />
                ))}
              </View>
            );
          },
        )}

      {activeTab === "goals" &&
        Object.entries(goalsGroupedByCreatedAt).map(([dateString, goals]) => {
          const [year, month, day] = dateString.split("-").map(Number);
          const localeDateString = new Date(
            year,
            month - 1,
            day,
          ).toLocaleDateString();

          return (
            <View key={dateString} className="gap-4">
              <View className="flex-row justify-between">
                <ThemedText>{localeDateString}</ThemedText>

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
          );
        })}
    </ScrollView>
  );
}
