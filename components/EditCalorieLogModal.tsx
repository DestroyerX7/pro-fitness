import { CalorieLog, createCalorieLogPreset } from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Image, Modal, Pressable, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "./ThemedText";
import ThemedTextInput from "./ThemedTextInput";

type Props = {
  calorieLog: CalorieLog;
  close: () => void;
  onSave: (calorieLog: CalorieLog) => void;
  onDelete: (calorieLogId: string) => void;
};

export default function EditCalorieLogModal({
  calorieLog,
  close,
  onSave,
  onDelete,
}: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(calorieLog.name);
  const [calories, setCalories] = useState(calorieLog.calories.toString());

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const createCalorieLogPresetMutation = useMutation({
    mutationFn: createCalorieLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogPresets", calorieLog.userId],
      });
    },
  });

  const showConfirmDeleteCalorieLog = async (calorieLog: CalorieLog) => {
    Alert.alert(
      `Delete ${calorieLog.name}`,
      "Are you sure you want to delete this calorie log?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(calorieLog.id),
          style: "destructive",
        },
      ],
    );

    await Haptics.selectionAsync();
  };

  const handleCreateCalorieLogPreset = async () => {
    createCalorieLogPresetMutation.mutate({
      userId: calorieLog.userId,
      name: calorieLog.name,
      calories: calorieLog.calories,
      imageUrl: calorieLog.imageUrl,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const save = () => {
    const trimmedName = name.trim();
    const caloriesNum = Number(calories);

    if (trimmedName.length < 1 || caloriesNum < 1) {
      return;
    }

    onSave({
      ...calorieLog,
      name,
      calories: caloriesNum,
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
                Edit Calorie Log
              </ThemedText>

              <Pressable
                className="p-2 border border-border bg-background rounded-xl justify-center items-center flex-row gap-2"
                onPress={handleCreateCalorieLogPreset}
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
              <ThemedText className="font-bold">Calories</ThemedText>

              <ThemedTextInput
                placeholder="Calories"
                value={calories}
                onChangeText={(text) => setCalories(text)}
                keyboardType="number-pad"
              />
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Date</ThemedText>

              <ThemedTextInput
                placeholder="Calories"
                defaultValue={calorieLog.date.toString()}
              />
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Image</ThemedText>

              <Pressable
                className="w-full aspect-square" /*onPress={takePicture}*/
              >
                {calorieLog.imageUrl !== null ? (
                  <Image
                    source={{ uri: calorieLog.imageUrl }}
                    style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
                  />
                ) : (
                  <View className="flex-1 border rounded-xl border-border items-center justify-center">
                    <MaterialCommunityIcons
                      name="food"
                      size={256}
                      color={theme.foreground}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            <View className="flex-row gap-4">
              <Pressable
                className="bg-destructive-accent p-4 rounded-xl items-center justify-center"
                onPress={() => showConfirmDeleteCalorieLog(calorieLog)}
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
