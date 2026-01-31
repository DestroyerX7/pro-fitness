import { useAuth } from "@/components/AuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalorieLog, Goal, User, WorkoutLog } from ".";

export default function History() {
  const [user, setUser] = useState<User | null>(null);
  const [yo, setYo] = useState<Record<string, CalorieLog[]>>({});
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const [editingCalorieLog, setEditingCalorieLog] = useState<CalorieLog | null>(
    null,
  );
  const [editingWorkoutLog, setEditingWorkoutLog] = useState<WorkoutLog | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<"calories" | "workouts" | "goals">(
    "calories",
  );

  const [goals, setGoals] = useState<Goal[]>([]);

  const { data } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const DAYS = 31;

  const dates: string[] = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  });

  const filledDates = dates.map((date) => ({
    date,
    calorieLogs: yo[date] ?? [],
  }));

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

        setYo(
          response.data.calorieLogs.reduce<Record<string, CalorieLog[]>>(
            (dict, calorieLog) => {
              if (!dict[calorieLog.date.toString()]) {
                dict[calorieLog.date.toString()] = [];
              }

              dict[calorieLog.date.toString()].push(calorieLog);
              return dict;
            },
            {},
          ),
        );
      };

      const getGoals = async () => {
        const response = await axios.get(
          `${baseUrl}/api/get-goals/${data?.user.id}`,
        );

        setGoals(response.data.goals);
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
      getGoals();
    }, []),
  );

  const toggleCompleted = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal,
      ),
    );
  };

  if (user === null) {
    return;
  }

  return (
    <SafeAreaView edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <ThemedText className="text-4xl font-bold">History</ThemedText>

        <View className="flex-row flex-wrap gap-4">
          {filledDates.map(({ date, calorieLogs }) => {
            const totalCalories = calorieLogs.reduce(
              (a, b) => a + b.calories,
              0,
            );

            return (
              <View
                key={date}
                className="w-16 h-16 rounded"
                style={{
                  backgroundColor:
                    totalCalories >= user.dailyCalorieGoal ? "green" : "gray",
                }}
              />
            );
          })}
        </View>

        {Object.entries(yo)
          .toReversed()
          .map(([date, calorieLogs]) => (
            <View key={date} className="gap-4">
              <ThemedText>{date}</ThemedText>

              {calorieLogs.map((calorieLog) => (
                <Card className="flex-row gap-4" key={calorieLog.id}>
                  {calorieLog.imageUrl !== null ? (
                    <Image
                      className="w-16 h-16 rounded"
                      source={{ uri: calorieLog.imageUrl }}
                    />
                  ) : (
                    <View className="w-16 h-16 items-center justify-center border border-border rounded">
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
                    <ThemedText color="text-muted-foreground">
                      {calorieLog.calories}
                    </ThemedText>
                  </View>
                </Card>
              ))}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
