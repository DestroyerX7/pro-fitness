import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 p-4 gap-4">
      <Pressable
        className="p-4 rounded-xl flex-row gap-4 border border-border bg-primaryForeground"
        onPress={() => router.push("/(tabs)/log/calories")}
      >
        <MaterialCommunityIcons
          name="food"
          size={64}
          color={colors.foreground}
        />

        <View className="gap-1 flex-1">
          <Text className="text-2xl text-foreground font-bold">
            Log Calories
          </Text>

          <Text className="text-secondaryForeground">
            Add food or drinks you have consumed to log their calories
          </Text>
        </View>
      </Pressable>

      <Pressable
        className="p-4 rounded-xl flex-row gap-4 border border-border bg-primaryForeground"
        onPress={() => router.push("/(tabs)/log/workout")}
      >
        <MaterialCommunityIcons
          name="run"
          size={64}
          color={colors.foreground}
        />

        <View className="gap-1 flex-1">
          <Text className="text-2xl text-foreground font-bold">
            Log Workout
          </Text>

          <Text className="text-secondaryForeground">
            Enter a workout to log its duration
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
