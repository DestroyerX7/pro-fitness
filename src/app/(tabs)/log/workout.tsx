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
      contentContainerClassName="p-4 gap-4"
      showsVerticalScrollIndicator={false}
    >
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
        <ThemedText className="font-bold">Performed At</ThemedText>

        <View className="text-foreground py-4 border border-border rounded-xl bg-muted">
          <DateTimePicker
            value={performedAt}
            mode="datetime"
            onValueChange={(_, selectedDate) => {
              setPerformedAt(selectedDate);
            }}
          />
        </View>
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Icon</ThemedText>

        <View className="flex-row gap-4 flex-wrap p-4 bg-muted border rounded-xl border-border">
          <WorkoutIconGrid
            value={selectedIconType}
            onValueChange={setSelectedIconType}
          />
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
    </ScrollView>
  );
}
