import { Goal } from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "./ThemedText";
import ThemedTextInput from "./ThemedTextInput";

type Props = {
  goal: Goal;
  close: () => void;
  onSave: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
};

export default function EditGoalModal({
  goal,
  close,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description || "");

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const showConfirmDeleteGoal = async (goal: Goal) => {
    Alert.alert(
      `Delete ${goal.name}`,
      "Are you sure you want to delete this goal?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(goal.id),
          style: "destructive",
        },
      ],
    );

    await Haptics.selectionAsync();
  };

  const save = () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 1) {
      return;
    }

    onSave({
      ...goal,
      name: trimmedName,
      description: trimmedDescription,
    });
  };

  return (
    <Modal animationType="slide" transparent={true}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1">
          <Pressable className="flex-1" onPress={close} />

          <View className="bg-background gap-4 rounded-t-[64px] pt-8 px-8 border-t border-x border-border">
            <View className="flex-row justify-between items-center">
              <ThemedText className="text-2xl font-bold">Edit Goal</ThemedText>

              <Pressable className="p-2 border border-border bg-background rounded-xl justify-center items-center flex-row gap-2">
                <MaterialCommunityIcons
                  name="eye-off"
                  size={24}
                  color={theme.foreground}
                />

                <ThemedText>Hide</ThemedText>
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
              <ThemedText className="font-bold">Description</ThemedText>

              <ThemedTextInput
                placeholder="Description"
                value={description}
                onChangeText={(text) => setDescription(text)}
                keyboardType="number-pad"
              />
            </View>

            <View className="gap-1">
              <ThemedText className="font-bold">Status</ThemedText>

              <View className="flex-row gap-4 items-center">
                <View className="w-16 h-16 rounded-full items-center justify-center bg-border">
                  {goal.completed ? (
                    <MaterialCommunityIcons
                      name="check"
                      color={theme.foreground}
                      size={32}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="close"
                      color={theme.muted}
                      size={32}
                    />
                  )}
                </View>

                <Text
                  style={{
                    color: goal.completed ? "#30d030" : theme.destructive,
                  }}
                >
                  {goal.completed ? "Completed" : "Not completed"}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <Pressable
                className="bg-destructive-accent p-4 rounded-xl items-center justify-center"
                onPress={() => showConfirmDeleteGoal(goal)}
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
