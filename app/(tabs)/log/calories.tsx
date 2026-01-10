import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Button, Image, Pressable, Text, TextInput, View } from "react-native";

export default function Calories() {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const logCalories = async () => {
    let imageUrl = null;

    if (image !== null) {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = `data:image/jpeg;base64,${base64}`;

      const response = await axios.post(
        "http://10.0.0.53:8081/api/upload-image",
        {
          file: fileData,
        }
      );

      imageUrl = response.data.url;
    }

    await axios.post("http://10.0.0.53:8081/api/log-calories", {
      userId: "htsrttp8sXmTrqo89LzklkHgOFtxXiSY",
      name,
      calories: Number(calories),
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
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Name"
        placeholderTextColor="gray"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <TextInput
        placeholder="Calories"
        placeholderTextColor="gray"
        value={calories}
        onChangeText={(text) => setCalories(text)}
      />

      <Button title="Log Calories" onPress={logCalories} />

      <Pressable onPress={takePicture}>
        <Text>Take Picture</Text>
      </Pressable>

      {image !== null && (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
        />
      )}
    </View>
  );
}
