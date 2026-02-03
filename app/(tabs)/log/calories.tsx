import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { createCalorieLog } from "@/lib/api";
import { backendUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";

export default function Calories() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const today = new Date();
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0"); // Add leading 0
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const [date, setDate] = useState(formatDate(today));

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
    const trimmedName = name.trim();
    const caloriesNum = Number(calories);

    if (authData === null || trimmedName.length < 1 || caloriesNum < 1) {
      return;
    }

    let imageUrl = null;

    if (image !== null) {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = `data:image/jpeg;base64,${base64}`;

      const response = await axios.post(`${backendUrl}/api/upload-image`, {
        file: fileData,
      });

      imageUrl = response.data.url;
    }

    createCalorieLogMutation.mutate({
      userId: authData.user.id,
      name: trimmedName,
      calories: caloriesNum,
      imageUrl,
      date,
    });
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

  const handleChange = (text: string) => {
    // Remove non-numeric characters
    let cleaned = text.replace(/\D/g, "");

    // Insert slashes
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2, 4) +
        "/" +
        cleaned.slice(4, 8);
    }

    setDate(cleaned);
  };

  return (
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

        <ThemedTextInput
          value={date}
          onChangeText={handleChange}
          placeholder="MM/DD/YYYY"
          keyboardType="number-pad"
          maxLength={10} // MM/DD/YYYY = 10 characters
        />
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

      <Pressable className="bg-primary p-4 rounded-full" onPress={logCalories}>
        <ThemedText
          color="text-primary-foreground"
          className="text-center text-lg font-bold"
        >
          Log Calories
        </ThemedText>
      </Pressable>
    </View>
  );
}
