import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import axios from "axios";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

export default function Goal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const createGoal = async () => {
    await axios.post(`${baseUrl}/api/create-goal`, {
      userId: data?.user.id,
      name,
      description,
    });
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

      <Pressable onPress={createGoal} className="bg-primary p-4 rounded-full">
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
