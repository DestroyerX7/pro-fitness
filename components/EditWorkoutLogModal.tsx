import { WorkoutLog } from "@/app/(tabs)";
import { Icon } from "@/app/(tabs)/log/workout";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  const [name, setName] = useState(workoutLog.name);
  const [duration, setDuration] = useState(workoutLog.duration.toString());
  const [selectedIcon, setSelectedIcon] = useState<Icon>({
    library: "MaterialCommunityIcons",
    name: "run",
  });

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

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

  const createWorkoutLogPreset = async (workoutLog: WorkoutLog) => {
    await axios.post(`${baseUrl}/api/create-workout-log-preset`, {
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
              <Text className="text-2xl font-bold">Edit Workout Log</Text>

              <Pressable
                className="p-2 border border-border bg-background rounded-lg justify-center items-center flex-row gap-2"
                onPress={() => createWorkoutLogPreset(workoutLog)}
              >
                <MaterialCommunityIcons
                  name="tune"
                  size={24}
                  color={theme.foreground}
                />

                <Text className="text-foreground">Create Preset</Text>
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Name</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-muted-foreground"
                placeholder="Name"
                value={name}
                onChangeText={(text) => setName(text)}
              />
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Duration</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-muted-foreground"
                placeholder="Calories"
                value={duration}
                onChangeText={(text) => setDuration(text)}
                keyboardType="number-pad"
              />
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Date</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-muted-foreground"
                placeholder="Calories"
                defaultValue={workoutLog.date.toString()}
              />
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Icon</Text>

              <WorkoutIconList
                defaultSelected={selectedIcon}
                onSelect={(icon) => setSelectedIcon(icon)}
              />
            </View>

            <View className="flex-row gap-4">
              <Pressable
                className="bg-[#ffdddd] p-4 rounded-lg items-center justify-center"
                onPress={() => showConfirmDeleteWorkoutLog(workoutLog)}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={24}
                  color={theme.destructive}
                />
              </Pressable>

              <Pressable
                className="bg-secondary p-4 rounded-lg flex-1 items-center justify-center"
                onPress={close}
              >
                <Text className="text-foreground font-bold">Cancel</Text>
              </Pressable>

              <Pressable
                className="bg-primary p-4 rounded-lg flex-1 items-center justify-center"
                onPress={save}
              >
                <Text className="text-primary-foreground font-bold">Save</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
