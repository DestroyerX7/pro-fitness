import { CalorieLog } from "@/app/(tabs)";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  const [name, setName] = useState(calorieLog.name);
  const [calories, setCalories] = useState(calorieLog.calories.toString());

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

  const createCalorieLogPreset = async (calorieLog: CalorieLog) => {
    await axios.post(`${baseUrl}/api/create-calorie-log-preset`, {
      userId: calorieLog.userId,
      name: calorieLog.name,
      calories: calorieLog.calories,
      imageUrl: calorieLog.imageUrl,
    });
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
              <Text className="text-2xl font-bold">Edit Calorie Log</Text>

              <Pressable
                className="p-2 border border-border bg-background rounded-lg justify-center items-center flex-row gap-2"
                onPress={() => createCalorieLogPreset(calorieLog)}
              >
                <MaterialCommunityIcons
                  name="tune"
                  size={24}
                  color={colors.foreground}
                />

                <Text className="text-foreground">Create Preset</Text>
              </Pressable>
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Name</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
                placeholder="Name"
                value={name}
                onChangeText={(text) => setName(text)}
              />
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Calories</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
                placeholder="Calories"
                value={calories}
                onChangeText={(text) => setCalories(text)}
                keyboardType="number-pad"
              />
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Date</Text>

              <TextInput
                className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
                placeholder="Calories"
                defaultValue={calorieLog.date.toString()}
              />
            </View>

            <View className="gap-1">
              <Text className="font-bold text-foreground">Image</Text>

              <Pressable
                className="w-full aspect-square" /*onPress={takePicture}*/
              >
                {calorieLog.imageUrl !== null ? (
                  <Image
                    source={{ uri: calorieLog.imageUrl }}
                    style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
                  />
                ) : (
                  <View className="flex-1 border rounded-2xl border-border items-center justify-center">
                    <MaterialCommunityIcons
                      name="food"
                      size={256}
                      color={colors.foreground}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            <View className="flex-row gap-4">
              <Pressable
                className="bg-[#ffdddd] p-4 rounded-lg items-center justify-center"
                onPress={() => showConfirmDeleteCalorieLog(calorieLog)}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={24}
                  color={colors.destructive}
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
                <Text className="text-primaryForeground font-bold">Save</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
