import { useAuth } from "@/components/AuthProvider";
import CalorieLogItem from "@/components/CalorieLogItem";
import ThemedText from "@/components/ThemedText";
import {
  CalorieLog,
  getCalorieLogs,
  getGoals,
  getUser,
  getWorkoutLogs,
} from "@/lib/api";
import { colors } from "@/lib/colors";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { ScrollView, View } from "react-native";
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
  });

  const { data: workoutLogs } = useQuery({
    queryKey: ["workoutLogs", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getWorkoutLogs(userId);
    },
  });

  const { data: goals } = useQuery({
    queryKey: ["goals", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getGoals(userId);
    },
  });

  if (user === undefined || calorieLogs === undefined) {
    return;
  }

  const DAYS = 31;

  const dates: string[] = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  });

  const calorieLogsGroupedByDate = calorieLogs.reduce<
    Record<string, CalorieLog[]>
  >((dict, calorieLog) => {
    if (!dict[calorieLog.date]) {
      dict[calorieLog.date] = [];
    }

    dict[calorieLog.date].push(calorieLog);
    return dict;
  }, {});

  const filledDates = dates.map((date) => {
    const datesCalorieLogs = calorieLogsGroupedByDate[date] ?? [];
    const totalCalories = datesCalorieLogs.reduce((a, b) => a + b.calories, 0);

    return {
      date,
      calorieLogs: datesCalorieLogs,
      totalCalories,
    };
  });

  return (
    <SafeAreaView edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <ThemedText className="text-4xl font-bold">History</ThemedText>

        <View className="flex-row flex-wrap gap-4">
          {filledDates.map(({ date, totalCalories }) => (
            <View
              key={date}
              className="w-16 h-16 rounded items-center justify-center"
              style={{
                backgroundColor:
                  totalCalories >= user.dailyCalorieGoal
                    ? "#30d030"
                    : theme.secondary,
              }}
            >
              <ThemedText>
                {((totalCalories / user.dailyCalorieGoal) * 100).toFixed(0)}%
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Only shows the last 31 days in history */}

        {filledDates
          .filter((f) => f.totalCalories > 0)
          .map(({ date, totalCalories, calorieLogs }) => {
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
      </ScrollView>
    </SafeAreaView>
  );
}
