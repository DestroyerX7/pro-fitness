import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Pressable, View } from "react-native";

export default function Index() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  return (
    <View className="flex-1 p-4 gap-4">
      <Pressable onPress={() => router.push("/(tabs)/log/calories")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="food"
            size={64}
            color={theme.foreground}
          />

          <View className="gap-1 flex-1">
            <ThemedText className="text-2xl font-bold">Log Calories</ThemedText>

            <ThemedText color="text-muted-foreground">
              Add food or drinks you have consumed to log their calories
            </ThemedText>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/workout")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="run"
            size={64}
            color={theme.foreground}
          />

          <View className="gap-1 flex-1">
            <ThemedText className="text-2xl font-bold">Log Workout</ThemedText>

            <ThemedText color="text-muted-foreground">
              Enter a workout to log its duration
            </ThemedText>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/scan")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="barcode-scan"
            size={64}
            color={theme.foreground}
          />

          <View className="gap-1 flex-1">
            <ThemedText className="text-2xl font-bold">Scan Barcode</ThemedText>

            <ThemedText color="text-muted-foreground">
              Use your camera to scan a barcode and log its calories
            </ThemedText>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/presets")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="tune"
            size={64}
            color={theme.foreground}
          />

          <View className="gap-1 flex-1">
            <ThemedText className="text-2xl font-bold">Presets</ThemedText>

            <ThemedText color="text-muted-foreground">
              Quickly log calories or workouts by using one of your saved
              presets
            </ThemedText>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/log/goal")}>
        <Card className="flex-row gap-4">
          <MaterialCommunityIcons
            name="bullseye-arrow"
            size={64}
            color={theme.foreground}
          />

          <View className="gap-1 flex-1">
            <ThemedText className="text-2xl font-bold">Create Goal</ThemedText>

            <ThemedText color="text-muted-foreground">
              Add a goal you want to accomplish
            </ThemedText>
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
