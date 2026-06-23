import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import {
  CalorieLog,
  createCalorieLogPreset,
  deleteCalorieLog,
  updateCalorieLog,
} from "@/lib/api";
import { colors } from "@/lib/colors";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Yo({
  calorieLog,
  onValueChanged,
}: {
  calorieLog: CalorieLog;
  onValueChanged?: (calorieLog: CalorieLog) => void;
}) {
  const [name, setName] = useState(calorieLog.name);
  const [calories, setCalories] = useState(calorieLog.calories.toString());

  const [consumedAt, setConsumedAt] = useState(
    new Date(calorieLog.consumedAt.toString()),
  );

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  useEffect(() => {
    const newCalorieLog = {
      ...calorieLog,
      name,
      calories: Number(calories),
      consumedAt,
    };

    onValueChanged?.(newCalorieLog);
  }, [name, calories, consumedAt]);

  return (
    <View className="gap-4">
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
        <ThemedText className="font-bold">Consumed At</ThemedText>

        <View className="text-foreground py-4 border border-border rounded-xl bg-muted">
          <DateTimePicker
            value={consumedAt}
            mode="datetime"
            onValueChange={(_, selectedDate) => {
              setConsumedAt(selectedDate);
            }}
          />
        </View>
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Image</ThemedText>

        <Pressable className="w-full aspect-square">
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
    </View>
  );
}

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const [calorieLog, setCalorieLog] = useState(
    queryClient
      .getQueryData<CalorieLog[]>(["calorieLogs", authData?.user.id ?? ""])
      ?.find((c) => c.id === id),
  );

  const updateCalorieLogMutaion = useMutation({
    mutationFn: updateCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
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
          onPress: () => handledeleteCalorieLog(calorieLog),
          style: "destructive",
        },
      ],
    );

    await Haptics.selectionAsync();
  };

  const deleteCalorieLogMutation = useMutation({
    mutationFn: deleteCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const saveCalorieLog = async (editedCalorieLog: CalorieLog) => {
    updateCalorieLogMutaion.mutate({ calorieLog: editedCalorieLog });
    router.back();
  };

  const handledeleteCalorieLog = async (calorieLog: CalorieLog) => {
    deleteCalorieLogMutation.mutate(calorieLog.id);
    router.back();
  };

  const createCalorieLogPresetMutation = useMutation({
    mutationFn: createCalorieLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogPresets", calorieLog?.userId],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleCreateCalorieLogPreset = async (calorieLog: CalorieLog) => {
    createCalorieLogPresetMutation.mutate({
      userId: calorieLog.userId,
      name: calorieLog.name,
      calories: calorieLog.calories,
      imageUrl: calorieLog.imageUrl,
    });
  };

  if (calorieLog === undefined) {
    router.back();
    return;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              className="p-2 justify-center items-center flex-row gap-2"
              onPress={() => handleCreateCalorieLogPreset(calorieLog)}
            >
              <MaterialCommunityIcons
                name="tune"
                size={24}
                color={theme.foreground}
              />

              <ThemedText>Create Preset</ThemedText>
            </Pressable>
          ),
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="p-4"
          className="flex-1"
        >
          <Yo calorieLog={calorieLog} onValueChanged={setCalorieLog} />
        </ScrollView>

        <View collapsable={false} className="flex-row gap-4 p-4">
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
            onPress={() => router.back()}
          >
            <ThemedText>Cancel</ThemedText>
          </Pressable>

          <Pressable
            className="bg-primary p-4 rounded-xl flex-1 items-center justify-center"
            onPress={() => saveCalorieLog(calorieLog)}
          >
            <ThemedText color="text-primary-foreground">Save</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}
