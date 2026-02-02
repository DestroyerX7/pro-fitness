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

export const iconComponents = {
  MaterialIcons,
  MaterialCommunityIcons,
} as const;

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

export default function Workout() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");

  const today = new Date();
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0"); // Add leading 0
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const [date, setDate] = useState(formatDate(today));

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
        queryKey: ["workoutLogs", authData?.user.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const logWorkout = async () => {
    const trimmedName = name.trim();
    const durationNum = Number(duration);

    if (authData === null || trimmedName.length < 1 || durationNum < 1) {
      return;
    }

    createWorkoutLogMutation.mutate({
      userId: authData.user.id,
      name: trimmedName,
      duration: durationNum,
      date,
      iconLibrary: selectedIcon.library,
      iconName: selectedIcon.name,
    });
  };

  const handleChange = (text: string) => {
    // Remove non-numeric characters
    let cleaned = text.replace(/\D/g, "");

    // Insert slashes
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2, 4) +
        "/" +
        cleaned.slice(4, 8);
    }

    setDate(cleaned);
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
          value={date}
          onChangeText={handleChange}
          placeholder="MM/DD/YYYY"
          keyboardType="number-pad"
          maxLength={10} // MM/DD/YYYY = 10 characters
        />
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Icon</ThemedText>

        <View className="flex-row gap-4 flex-wrap p-4 bg-muted border rounded-xl border-border">
          {icons.map((icon, index) => {
            const IconComponent = iconComponents[icon.library];

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
