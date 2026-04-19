import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { createCalorieLog, uploadToCloudinary } from "@/lib/api";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Calories() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [date, setDate] = useState(new Date());

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const createCalorieLogMutation = useMutation({
    mutationFn: createCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const logCalories = async () => {
    // Toast.show({ type: "info", text1: "Logging..." });

    const trimmedName = name.trim();
    const caloriesNum = Number(calories);

    if (authData === null || trimmedName.length < 1 || caloriesNum < 1) {
      Toast.show({
        type: "error",
        text1: "Invalid name or calories",
        visibilityTime: 3000,
        position: "top",
      });

      return;
    }

    const imageUrl = image !== null ? await uploadToCloudinary(image) : null;
    const dateString = date.toDateString();

    createCalorieLogMutation.mutate({
      userId: authData.user.id,
      name: trimmedName,
      calories: caloriesNum,
      imageUrl,
      date: dateString,
    });

    // Toast.hide();
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    setImage(result.assets[0].uri);
  };

  const onChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate ?? date;
    // setShow(Platform.OS === "ios"); // Keep open on iOS, close on Android
    setDate(currentDate);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="p-4 gap-4">
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
            <ThemedText className="font-bold">Calories</ThemedText>

            <ThemedTextInput
              placeholder="Calories"
              keyboardType="number-pad"
              value={calories}
              onChangeText={(text) => setCalories(text)}
            />
          </View>
        </View>

        <View className="gap-1">
          <ThemedText className="font-bold">Date</ThemedText>

          <View className="text-foreground py-4 border border-border rounded-xl bg-muted">
            <DateTimePicker
              value={date}
              mode="datetime" // 'date' | 'time' | 'datetime'
              display="default" // 'default' | 'spinner' | 'calendar' | 'clock'
              onChange={onChange}
            />
          </View>
        </View>

        <View className="gap-1">
          <ThemedText className="font-bold">Image</ThemedText>

          <Pressable className="w-full aspect-square" onPress={takePicture}>
            {image !== null ? (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
              />
            ) : (
              <View className="border border-border rounded-xl h-full items-center justify-center bg-muted">
                <MaterialCommunityIcons
                  name="camera"
                  size={128}
                  color={theme.foreground}
                />

                <ThemedText className="text-2xl font-bold">
                  No picture taken
                </ThemedText>

                <ThemedText color="text-muted-foreground">
                  Tap to take a picture
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>

        <Pressable
          className="bg-primary p-4 rounded-full"
          onPress={logCalories}
        >
          <ThemedText
            color="text-primary-foreground"
            className="text-center text-lg font-bold"
          >
            Log Calories
          </ThemedText>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}
