import Card from "@/components/Card";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 p-4 gap-4">
      <Pressable onPress={() => router.push("/(tabs)/log/calories")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="food"
            size={64}
            color={colors.foreground}
          />

          <View className="gap-1 flex-1">
            <Text className="text-2xl text-foreground font-bold">
              Log Calories
            </Text>

            <Text className="text-muted-foreground">
              Add food or drinks you have consumed to log their calories
            </Text>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/workout")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="run"
            size={64}
            color={colors.foreground}
          />

          <View className="gap-1 flex-1">
            <Text className="text-2xl text-foreground font-bold">
              Log Workout
            </Text>

            <Text className="text-muted-foreground">
              Enter a workout to log its duration
            </Text>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/scan")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="barcode-scan"
            size={64}
            color={colors.foreground}
          />

          <View className="gap-1 flex-1">
            <Text className="text-2xl text-foreground font-bold">
              Scan Barcode
            </Text>

            <Text className="text-muted-foreground">
              Use your camera to scan a barcode and log its calories
            </Text>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/presets")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="tune"
            size={64}
            color={colors.foreground}
          />

          <View className="gap-1 flex-1">
            <Text className="text-2xl text-foreground font-bold">Presets</Text>

            <Text className="text-muted-foreground">
              Quickly log calories or workouts by using one of your saved
              presets
            </Text>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/test")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="test-tube"
            size={64}
            color={colors.foreground}
          />

          <View className="gap-1 flex-1">
            <Text className="text-2xl text-foreground font-bold">Test</Text>

            <Text className="text-muted-foreground">Test</Text>
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
