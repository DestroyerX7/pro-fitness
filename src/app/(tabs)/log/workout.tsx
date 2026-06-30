import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid, { IconType } from "@/components/WorkoutIconGrid";
import { createWorkoutLog } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Workout() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [performedAt, setPerformedAt] = useState(new Date());
  const [selectedIconType, setSelectedIconType] = useState<IconType>({
    library: "MaterialCommunityIcons",
    name: "run",
  });

  const insets = useSafeAreaInsets();

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", user.id],
      });

      Toast.show({
        type: "loggedWorkout",
        text1: "Logged!",
        text2: `${data.name} • ${data.duration} mins`,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const logWorkout = async () => {
    const trimmedName = name.trim();
    const durationNum = Number(duration);

    if (trimmedName.length < 1 || durationNum < 1) {
      return;
    }

    const performedAtString = toSqlTimestamp(performedAt);

    createWorkoutLogMutation.mutate({
      userId: user.id,
      name: trimmedName,
      duration: durationNum,
      performedAt: performedAtString,
      iconLibrary: selectedIconType.library,
      iconName: selectedIconType.name,
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4 gap-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Name</ThemedText>

        <ThemedTextInput
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />

        <View className="flex-row flex-wrap gap-2 pt-2">
          {[
            "Push",
            "Pull",
            "Legs",
            "Upper",
            "Lower",
            "Chest",
            "Shoulders",
            "Arms",
            "Cardio",
          ].map((label) => (
            <Pressable
              key={label}
              onPress={() => setName(label)}
              className="rounded-full border border-border bg-muted px-3 py-1.5 active:opacity-80"
            >
              <ThemedText className="text-sm">{label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Duration</ThemedText>

        <ThemedTextInput
          placeholder="Duration"
          keyboardType="number-pad"
          value={duration}
          onChangeText={(text) => setDuration(text)}
        />

        <View className="flex-row flex-wrap gap-2 pt-2">
          {["15", "30", "45", "60", "75", "90", "105", "120"].map((label) => (
            <Pressable
              key={label}
              onPress={() => setDuration(label)}
              className="rounded-full border border-border bg-muted px-3 py-1.5 active:opacity-80"
            >
              <ThemedText className="text-sm">{label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Performed At</ThemedText>

        <View className="text-foreground px-2 py-1 border border-border rounded-xl bg-muted">
          <DateTimePicker
            value={performedAt}
            mode="datetime"
            onValueChange={(_, selectedDate) => {
              setPerformedAt(selectedDate);
            }}
          />
        </View>
      </View>

      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Icon</ThemedText>

        <View className="flex-row gap-4 flex-wrap p-4 bg-muted border rounded-xl border-border">
          <WorkoutIconGrid
            value={selectedIconType}
            onValueChange={setSelectedIconType}
            numColumns={6}
          />
        </View>
      </View>

      <Pressable onPress={logWorkout} className="bg-primary py-3 rounded-xl">
        <ThemedText className="text-primary-foreground text-center font-medium">
          Log Workout
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}
