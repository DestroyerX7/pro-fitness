import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function Workout() {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");

  return (
    <View className="p-4 gap-4">
      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Duration"
        value={calories}
        onChangeText={(text) => setCalories(text)}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Date"
        value={new Date().toLocaleDateString()}
      />

      {/* Add icons */}

      <Pressable className="bg-primary p-4 rounded-full">
        <Text className="text-primaryForeground text-center text-lg font-bold">
          Log Workout
        </Text>
      </Pressable>
    </View>
  );
}
