import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import GoalItem from "@/components/GoalItem";
import NutritionLogItem from "@/components/NutritionLogItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useDailyTarget from "@/hooks/useDailyTarget";
import useGoals from "@/hooks/useGoals";
import useNutritionLogs from "@/hooks/useNutritionLogs";
import useTheme from "@/hooks/useTheme";
import useWorkoutLogs from "@/hooks/useWorkoutLogs";
import { Goal, NutritionLog, WorkoutLog } from "@/lib/api";
import { toSqlDate } from "@/lib/dates";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const startedColor = "#004000";
const halfwayColor = "#108010";
const completedColor = "#20b020";

export default function History() {
  const { user } = useAuthenticatedAuth();
  const { data: dailyTarget } = useDailyTarget(user.id);
  const { data: nutritionLogs } = useNutritionLogs(user.id);
  const { data: workoutLogs } = useWorkoutLogs(user.id);
  const { data: goals } = useGoals(user.id);

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const theme = useTheme();

  if (
    dailyTarget === undefined ||
    nutritionLogs === undefined ||
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

  const nutritionLogsGroupedByDate = nutritionLogs.reduce<
    Record<string, { nutritionLogs: NutritionLog[]; totalCalories: number }>
  >((dict, nutritionLog) => {
    const dateString = toSqlDate(nutritionLog.consumedAt);

    if (dict[dateString] === undefined) {
      dict[dateString] = {
        nutritionLogs: [],
        totalCalories: 0,
      };
    }

    dict[dateString].nutritionLogs.push(nutritionLog);
    dict[dateString].totalCalories += nutritionLog.calories;

    return dict;
  }, {});

  const workoutLogsGroupedByDate = workoutLogs.reduce<
    Record<string, { workoutLogs: WorkoutLog[]; totalDurationMinutes: number }>
  >((dict, workoutLog) => {
    const dateString = toSqlDate(workoutLog.performedAt);

    if (dict[dateString] === undefined) {
      dict[dateString] = {
        workoutLogs: [],
        totalDurationMinutes: 0,
      };
    }

    dict[dateString].workoutLogs.push(workoutLog);
    dict[dateString].totalDurationMinutes += workoutLog.durationMinutes;

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
            nutritionLogsGroupedByDate[dateString]?.totalCalories ?? 0;
          const backgroundColor =
            totalCalories >= dailyTarget.calorieTarget
              ? completedColor
              : totalCalories >= dailyTarget.calorieTarget * 0.5
                ? halfwayColor
                : totalCalories > 0
                  ? startedColor
                  : theme.secondary;

          const percentComplete = (
            (totalCalories / dailyTarget.calorieTarget) *
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
        Object.entries(nutritionLogsGroupedByDate).map(
          ([dateString, { nutritionLogs, totalCalories }]) => {
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

                {nutritionLogs.map((nutritionLog) => (
                  <NutritionLogItem
                    key={nutritionLog.id}
                    id={nutritionLog.id}
                    name={nutritionLog.name}
                    calories={nutritionLog.calories}
                    imageUrl={nutritionLog.imageUrl}
                  />
                ))}
              </View>
            );
          },
        )}

      {activeTab === "workouts" &&
        Object.entries(workoutLogsGroupedByDate).map(
          ([
            dateString,
            { workoutLogs, totalDurationMinutes: totalDuration },
          ]) => {
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
                    durationMinutes={workoutLog.durationMinutes}
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
