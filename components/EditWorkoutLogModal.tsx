import { Icon } from "@/app/(tabs)/log/workout";
import { createWorkoutLogPreset, WorkoutLog } from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Modal, Pressable, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "./ThemedText";
import ThemedTextInput from "./ThemedTextInput";
import WorkoutIconList from "./WorkoutIconList";

type Props = {
  workoutLog: WorkoutLog;
  close: () => void;
  onSave: (workoutLog: WorkoutLog) => void;
  onDelete: (workoutLogId: string) => void;
};

export default function EditWorkoutLogModal({
  workoutLog,
  close,
  onSave,
  onDelete,
}: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(workoutLog.name);
  const [duration, setDuration] = useState(workoutLog.duration.toString());
  const [selectedIcon, setSelectedIcon] = useState<Icon>({
    library: "MaterialCommunityIcons",
    name: "run",
  });

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const createWorkoutLogPresetMutation = useMutation({
    mutationFn: createWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogPresets", workoutLog.userId],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const showConfirmDeleteWorkoutLog = async (workoutLog: WorkoutLog) => {
    Alert.alert(
      `Delete ${workoutLog.name}`,
      "Are you sure you want to delete this workout log?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(workoutLog.id),
          style: "destructive",
        },
      ],
    );

    await Haptics.selectionAsync();
  };

  const handleCreateWorkoutLogPreset = async () => {
    createWorkoutLogPresetMutation.mutate({
      userId: workoutLog.userId,
      name: workoutLog.name,
      duration: workoutLog.duration,
      iconLibrary: workoutLog.iconLibrary,
      iconName: workoutLog.iconName,
    });
  };

  const save = () => {
    const trimmedName = name.trim();
    const durationNum = Number(duration);

    if (trimmedName.length < 1 || durationNum < 1) {
      return;
    }

    onSave({
      ...workoutLog,
      name: trimmedName,
      duration: durationNum,
      iconLibrary: selectedIcon.library,
      iconName: selectedIcon.name,
    });
  };

  return (
    <Modal animationType="slide" transparent={true}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1">
          <Pressable className="flex-1" onPress={close} />

          <View className="bg-background gap-4 rounded-t-[64px] pt-8 px-8 border-t border-x border-border">
            <View className="flex-row justify-between items-center">
              <ThemedText className="text-2xl font-bold">
                Edit Workout Log
              </ThemedText>

              <Pressable
                className="p-2 border border-border bg-background rounded-xl justify-center items-center flex-row gap-2"
                onPress={handleCreateWorkoutLogPreset}
              >
                <MaterialCommunityIcons
                  name="tune"
                  size={24}
                  color={theme.foreground}
                />

                <ThemedText>Create Preset</ThemedText>
              </Pressable>
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Name</ThemedText>

              <ThemedTextInput
                placeholder="Name"
                value={name}
                onChangeText={(text) => setName(text)}
              />
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Duration</ThemedText>

              <ThemedTextInput
                placeholder="Calories"
                value={duration}
                onChangeText={(text) => setDuration(text)}
                keyboardType="number-pad"
              />
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Date</ThemedText>

              <ThemedTextInput
                placeholder="Calories"
                defaultValue={workoutLog.date.toString()}
              />
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Icon</ThemedText>

              <WorkoutIconList
                defaultSelected={selectedIcon}
                onSelect={(icon) => setSelectedIcon(icon)}
              />
            </View>

            <View className="flex-row gap-4">
              <Pressable
                className="bg-destructive-accent p-4 rounded-xl items-center justify-center"
                onPress={() => showConfirmDeleteWorkoutLog(workoutLog)}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={24}
                  color={theme.destructive}
                />
              </Pressable>

              <Pressable
                className="bg-secondary p-4 rounded-xl flex-1 items-center justify-center"
                onPress={close}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>

              <Pressable
                className="bg-primary p-4 rounded-xl flex-1 items-center justify-center"
                onPress={save}
              >
                <ThemedText color="text-primary-foreground">Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
