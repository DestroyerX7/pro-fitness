import { colors } from "@/lib/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CalorieLog = {
  id: string;
  name: string;
  calories: number;
  // date: Date;
  imageUrl: string | null;
};

export default function Index() {
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([]);

  useEffect(() => {
    const getCalorieLogs = async () => {
      const response: { data: { calorieLogs: CalorieLog[] } } = await axios.get(
        "http://10.0.0.53:8081/api/get-calorie-logs/htsrttp8sXmTrqo89LzklkHgOFtxXiSY"
      );

      setCalorieLogs(response.data.calorieLogs);
    };

    getCalorieLogs();
  }, []);

  const loggedCalories = calorieLogs.reduce((a, b) => a + b.calories, 0);

  const loggedWorkoutTime = 30;

  return (
    <SafeAreaView className="p-4 gap-4">
      <Text className="text-4xl font-bold text-foreground">Home</Text>

      <View className="bg-white p-4 border rounded-xl border-border gap-4">
        <Text className="text-2xl font-bold text-foreground">
          Today's Calories
        </Text>

        <Text className="text-foreground">
          <Text className="text-4xl font-bold">{loggedCalories}</Text> / 2600
        </Text>

        <View className="h-8 bg-secondary rounded-full">
          <View
            className="h-full bg-[#30d030] rounded-full"
            style={{
              width: `${(loggedCalories / 2600) * 100}%`,
            }}
          />
        </View>

        <View className="flex-row justify-between">
          <Text className="text-secondaryForeground">
            {2600 - loggedCalories} calories remaining
          </Text>

          <Text className="text-secondaryForeground">
            {((loggedCalories / 2600) * 100).toFixed(2)}%
          </Text>
        </View>
      </View>

      <View className="bg-white p-4 border rounded-xl border-border gap-4">
        <Text className="text-2xl font-bold text-foreground">Workout Time</Text>

        <Text className="text-foreground">
          <Text className="text-4xl font-bold">{loggedWorkoutTime}</Text> / 90
        </Text>

        <View className="h-8 bg-secondary rounded-full">
          <View
            className="h-full bg-primary rounded-full"
            style={{
              width: `${(loggedWorkoutTime / 90) * 100}%`,
            }}
          />
        </View>

        <View className="flex-row justify-between">
          <Text className="text-secondaryForeground">
            {90 - loggedWorkoutTime} mins remaining
          </Text>

          <Text className="text-secondaryForeground">
            {((loggedWorkoutTime / 90) * 100).toFixed(2)}%
          </Text>
        </View>
      </View>

      {calorieLogs.map(({ id, imageUrl, name, calories }) => (
        <View
          className="flex-row p-4 gap-4 border rounded-xl bg-primaryForeground border-border"
          key={id}
        >
          {imageUrl !== null ? (
            <Image
              className="w-16 h-16 rounded-md"
              source={{ uri: imageUrl }}
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
            <Text className="text-lg font-bold text-foreground">{name}</Text>
            <Text className="text-secondaryForeground">{calories}</Text>
          </View>

          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={colors.foreground}
          />
        </View>
      ))}
    </SafeAreaView>
  );
}
