import { AuthContext } from "@/components/AuthProvider";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { iconLibraries } from "./log/workout";

export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  dailyCalorieGoal: number;
  dailyWorkoutGoal: number;
  createdAt: Date;
};

type CalorieLog = {
  id: string;
  name: string;
  calories: number;
  date: Date;
  imageUrl: string | null;
};

type WorkoutLog = {
  id: string;
  name: string;
  duration: number;
  date: string;
  iconName: string;
  iconLibrary: "MaterialIcons" | "MaterialCommunityIcons";
};

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [editingCalorieLog, setEditingCalorieLog] = useState<CalorieLog | null>(
    null
  );

  const { data } = useContext(AuthContext);

  useEffect(() => {
    const getUser = async () => {
      const response: { data: { user: User } } = await axios.get(
        `${baseUrl}/api/get-user/${data?.user.id}`
      );

      setUser(response.data.user);
    };

    const getCalorieLogs = async () => {
      const response: { data: { calorieLogs: CalorieLog[] } } = await axios.get(
        `${baseUrl}/api/get-calorie-logs/${data?.user.id}`
      );

      setCalorieLogs(
        response.data.calorieLogs /*.filter(
          (log) =>
            new Date(log.date).toDateString() === new Date().toDateString()
        )*/
      );
    };

    const getWorkoutLogs = async () => {
      const response: { data: { workoutLogs: WorkoutLog[] } } = await axios.get(
        `${baseUrl}/api/get-workout-logs/${data?.user.id}`
      );

      setWorkoutLogs(
        response.data.workoutLogs /*.filter(
          (log) =>
            new Date(log.date).toDateString() === new Date().toDateString()
        )*/
      );
    };

    getUser();
    getCalorieLogs();
    getWorkoutLogs();
  }, []);

  const editCalorieLog = async (calorieLog: CalorieLog) => {
    setEditingCalorieLog(calorieLog);
    await Haptics.selectionAsync();
  };

  const show = async (calorieLog: CalorieLog) => {
    Alert.alert(
      `Delete ${calorieLog.name}`,
      "Are you sure you want to delete this calorie log?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteCalorieLog(calorieLog.id),
          style: "destructive",
        },
      ]
    );

    await Haptics.selectionAsync();
  };

  const deleteCalorieLog = async (calorieLogId: string) => {
    await axios.delete("http://10.0.0.53:8081/api/delete-calorie-log", {
      data: {
        calorieLogId,
      },
    });

    setEditingCalorieLog(null);
    setCalorieLogs(calorieLogs.filter((c) => c.id !== calorieLogId));
  };

  if (user === null) {
    return;
  }

  const loggedCalories = calorieLogs.reduce((a, b) => a + b.calories, 0);
  const loggedWorkoutTime = workoutLogs.reduce((a, b) => a + b.duration, 0);

  return (
    <SafeAreaView className="p-4 gap-4">
      <Modal
        animationType="slide"
        visible={editingCalorieLog !== null}
        transparent={true}
      >
        <SafeAreaProvider>
          <SafeAreaView className="flex-1">
            <Pressable
              className="flex-1"
              onPress={() => setEditingCalorieLog(null)}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS == "ios" ? "padding" : "height"}
              keyboardVerticalOffset={16}
              className="bg-primaryForeground gap-4 rounded-t-[64px] p-12 border-t border-x border-border"
            >
              <Text className="text-2xl font-bold">Edit Calorie Log</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
                placeholder="Name"
                defaultValue={editingCalorieLog?.name}
              />

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
                placeholder="Calories"
                defaultValue={editingCalorieLog?.calories.toString()}
              />

              <Pressable
                className="bg-destructive p-4 rounded-lg"
                onPress={() => show(editingCalorieLog!)}
              >
                <Text className="text-primaryForeground">Delete</Text>
              </Pressable>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      <Text className="text-4xl font-bold text-foreground">Home</Text>

      {workoutLogs.map((workoutLog) => {
        const IconComponent = iconLibraries[workoutLog.iconLibrary];

        return (
          <View
            className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border"
            key={workoutLog.id}
          >
            <IconComponent
              name={workoutLog.iconName as any}
              size={48}
              color={colors.foreground}
            />

            <View className="flex-1 gap-2">
              <Text className="text-lg font-bold text-foreground">
                {workoutLog.name}
              </Text>
              <Text className="text-secondaryForeground">
                {workoutLog.duration} minutes
              </Text>
            </View>

            <Pressable>
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={colors.foreground}
              />
            </Pressable>
          </View>
        );
      })}

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
        data={calorieLogs}
        ListHeaderComponent={
          <View className="gap-4">
            <View className="bg-white p-4 border rounded-xl border-border gap-4">
              <View className="flex-row justify-between">
                <Text className="text-2xl font-bold text-foreground">
                  Today's Calories
                </Text>

                <Pressable
                  onPress={async () => {
                    Alert.prompt(
                      "Edit calorie goal",
                      "Update your daily calorie goal",
                      async (text) => {
                        const response: { data: { user: User } } =
                          await axios.patch(
                            "http://10.0.0.53:8081/api/update-daily-calorie-goal",
                            {
                              userId: user.id,
                              dailyCalorieGoal: Number(text),
                            }
                          );

                        setUser(response.data.user);
                      },
                      "plain-text",
                      user.dailyCalorieGoal.toString(),
                      "number-pad"
                    );

                    await Haptics.selectionAsync();
                  }}
                >
                  <MaterialIcons
                    name="mode-edit"
                    size={24}
                    color={colors.foreground}
                  />
                </Pressable>
              </View>

              <Text className="text-foreground">
                <Text className="text-4xl font-bold">{loggedCalories}</Text> /{" "}
                {user.dailyCalorieGoal}
              </Text>

              <View className="h-8 bg-secondary rounded-full">
                <View
                  className="h-full bg-[#30d030] rounded-full"
                  style={{
                    width: `${Math.min((loggedCalories / user.dailyCalorieGoal) * 100, 100)}%`,
                  }}
                />
              </View>

              <View className="flex-row justify-between">
                <Text className="text-secondaryForeground">
                  {Math.max(user.dailyCalorieGoal - loggedCalories, 0)} calories
                  remaining
                </Text>

                <Text className="text-secondaryForeground">
                  {((loggedCalories / user.dailyCalorieGoal) * 100).toFixed(2)}%
                </Text>
              </View>
            </View>

            <View className="bg-white p-4 border rounded-xl border-border gap-4">
              <View className="flex-row justify-between">
                <Text className="text-2xl font-bold text-foreground">
                  Workout Time
                </Text>

                <MaterialIcons
                  name="mode-edit"
                  size={24}
                  color={colors.foreground}
                />
              </View>

              <Text className="text-foreground">
                <Text className="text-4xl font-bold">{loggedWorkoutTime}</Text>{" "}
                / {user.dailyWorkoutGoal}
              </Text>

              <View className="h-8 bg-secondary rounded-full">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${Math.min((loggedWorkoutTime / user.dailyWorkoutGoal) * 100, 100)}%`,
                  }}
                />
              </View>

              <View className="flex-row justify-between">
                <Text className="text-secondaryForeground">
                  {Math.max(user.dailyWorkoutGoal - loggedWorkoutTime, 0)} mins
                  remaining
                </Text>

                <Text className="text-secondaryForeground">
                  {((loggedWorkoutTime / user.dailyWorkoutGoal) * 100).toFixed(
                    2
                  )}
                  %
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-2xl font-bold text-foreground">
                Calories
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border">
            {item.imageUrl !== null ? (
              <Image
                className="w-16 h-16 rounded-md"
                source={{ uri: item.imageUrl }}
              />
            ) : (
              <View className="w-16 h-16 border rounded-md border-border items-center justify-center">
                <MaterialCommunityIcons
                  name="food"
                  size={32}
                  color={colors.foreground}
                />
              </View>
            )}

            <View className="flex-1 gap-2">
              <Text className="text-lg font-bold text-foreground">
                {item.name}
              </Text>
              <Text className="text-secondaryForeground">{item.calories}</Text>
            </View>

            <Pressable onPress={() => editCalorieLog(item)}>
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={colors.foreground}
              />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
