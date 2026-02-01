import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { createWorkoutLog } from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

export type Icon =
  | { library: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
  | {
      library: "MaterialCommunityIcons";
      name: keyof typeof MaterialCommunityIcons.glyphMap;
    };

const icons: Icon[] = [
  { library: "MaterialCommunityIcons", name: "run" },
  { library: "MaterialCommunityIcons", name: "dumbbell" },
  { library: "MaterialCommunityIcons", name: "weight-lifter" },
  { library: "MaterialCommunityIcons", name: "arm-flex" },
  { library: "MaterialCommunityIcons", name: "bike" },
  { library: "MaterialCommunityIcons", name: "swim" },
  { library: "MaterialCommunityIcons", name: "gymnastics" },
  { library: "MaterialCommunityIcons", name: "football" },
  { library: "MaterialCommunityIcons", name: "soccer" },
  { library: "MaterialCommunityIcons", name: "basketball" },
  { library: "MaterialCommunityIcons", name: "tennis" },
  { library: "MaterialCommunityIcons", name: "table-tennis" },
  { library: "MaterialCommunityIcons", name: "golf" },
  { library: "MaterialCommunityIcons", name: "bowling" },
  { library: "MaterialCommunityIcons", name: "ski" },
  { library: "MaterialCommunityIcons", name: "snowboard" },
  { library: "MaterialIcons", name: "ice-skating" },
  { library: "MaterialCommunityIcons", name: "bow-arrow" },
];

export const iconLibraries = {
  MaterialIcons,
  MaterialCommunityIcons,
};

export default function Workout() {
  const { data } = useAuth();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<Icon>({
    library: "MaterialCommunityIcons",
    name: "run",
  });

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", data?.user.id],
      });
    },
  });

  const logWorkout = async () => {
    const trimmedName = name.trim();
    const durationNum = Number(duration);

    if (data === null || trimmedName.length < 1 || durationNum < 1) {
      return;
    }

    createWorkoutLogMutation.mutate({
      userId: data.user.id,
      name: trimmedName,
      duration: durationNum,
      iconLibrary: selectedIcon.library,
      iconName: selectedIcon.name,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View className="p-4 gap-4">
      <View className="flex-row gap-4 items-end">
        <View className="gap-1 flex-1">
          <ThemedText className="font-bold">Name</ThemedText>

          <ThemedTextInput
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </View>

        <View className="gap-1 flex-1">
          <ThemedText className="font-bold">Duration</ThemedText>

          <ThemedTextInput
            placeholder="Duration"
            keyboardType="number-pad"
            value={duration}
            onChangeText={(text) => setDuration(text)}
          />
        </View>
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Date</ThemedText>

        <ThemedTextInput
          placeholder="Date"
          value={new Date().toLocaleDateString()}
        />
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Icon</ThemedText>

        <View className="flex-row gap-4 flex-wrap p-4 bg-muted border rounded-xl border-border">
          {icons.map((icon, index) => {
            const IconComponent = iconLibraries[icon.library];

            return (
              <Pressable
                key={index}
                className="w-16 h-16 items-center justify-center rounded-md"
                style={[
                  selectedIcon.library === icon.library &&
                    selectedIcon.name === icon.name && {
                      borderWidth: 2,
                      borderColor: theme.foreground,
                    },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <IconComponent
                  name={icon.name as any}
                  size={48}
                  color={theme.foreground}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable onPress={logWorkout} className="bg-primary p-4 rounded-full">
        <ThemedText
          color="text-primary-foreground"
          className="text-center text-lg font-bold"
        >
          Log Workout
        </ThemedText>
      </Pressable>
    </View>
  );
}
