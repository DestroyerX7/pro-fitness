import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { createGoal } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

export default function Goal() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleCreateGoal = async () => {
    if (authData === null) {
      return;
    }

    createGoalMutation.mutate({ userId: authData.user.id, name, description });
  };

  return (
    <View className="p-4 gap-4">
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
          className="h-32"
          placeholder="Description..."
          value={description}
          onChangeText={(text) => setDescription(text)}
          textAlignVertical="top"
          multiline
        />
      </View>

      <Pressable
        onPress={handleCreateGoal}
        className="bg-primary p-4 rounded-full"
      >
        <ThemedText
          color="text-primary-foreground"
          className="text-center text-lg font-bold"
        >
          Create Goal
        </ThemedText>
      </Pressable>
    </View>
  );
}
