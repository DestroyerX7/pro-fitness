import { useAuth } from "@/components/AuthProvider";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function Calories() {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const { data } = useAuth();

  const logCalories = async () => {
    const trimmedName = name.trim();
    const caloriesNum = Number(calories);

    if (trimmedName.length < 1 || caloriesNum < 1) {
      return;
    }

    let imageUrl = null;

    if (image !== null) {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = `data:image/jpeg;base64,${base64}`;

      const response = await axios.post(`${baseUrl}/api/upload-image`, {
        file: fileData,
      });

      imageUrl = response.data.url;
    }

    await axios.post(`${baseUrl}/api/log-calories`, {
      userId: data?.user.id,
      name: trimmedName,
      calories: caloriesNum,
      imageUrl,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  return (
    <View className="p-4 gap-4">
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
          keyboardType="number-pad"
          value={calories}
          onChangeText={(text) => setCalories(text)}
        />
      </View>

      <View className="gap-1">
        <Text className="font-bold text-foreground">Date</Text>

        <TextInput
          className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
          placeholder="Date"
          value={new Date().toLocaleDateString()}
        />
      </View>

      <View className="gap-1">
        <Text className="font-bold text-foreground">Image</Text>

        <Pressable className="w-full aspect-square" onPress={takePicture}>
          {image !== null ? (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
            />
          ) : (
            <View className="border border-border rounded-2xl h-full items-center justify-center">
              <MaterialCommunityIcons
                name="camera"
                size={128}
                color={colors.secondary}
              />

              <Text className="text-2xl font-bold text-foreground">
                No picture taken
              </Text>

              <Text className="text-secondaryForeground">
                Tap to take a picture
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <Pressable className="bg-primary p-4 rounded-full" onPress={logCalories}>
        <Text className="text-primaryForeground text-center text-lg font-bold">
          Log Calories
        </Text>
      </Pressable>
    </View>
  );
}
