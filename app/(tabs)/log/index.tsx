import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View>
      <Pressable onPress={() => router.push("/(tabs)/log/calories")}>
        <Text>Log Calories</Text>
      </Pressable>

      {/* <Pressable onPress={() => router.push("/(tabs)/log/workout")}>
        <Text>Log Workout</Text>
      </Pressable> */}
    </View>
  );
}
