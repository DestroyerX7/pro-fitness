import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { createCalorieLog, uploadToCloudinary } from "@/lib/api";
import { colors } from "@/lib/colors";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Calories() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [consumedAt, setConsumedAt] = useState(new Date());

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const insets = useSafeAreaInsets();

  const createCalorieLogMutation = useMutation({
    mutationFn: createCalorieLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });

      Toast.show({
        type: "loggedFood",
        text1: "Logged!",
        text2: `${data.name} • ${data.calories} cal`,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const logCalories = async () => {
    const trimmedName = name.trim();
    const caloriesNum = Number(calories);

    if (authData === null || trimmedName.length < 1 || caloriesNum < 1) {
      return;
    }

    const imageUrl = image !== null ? await uploadToCloudinary(image) : null;
    const consumedAtString = consumedAt.toISOString();

    createCalorieLogMutation.mutate({
      userId: authData.user.id,
      name: trimmedName,
      calories: caloriesNum,
      imageUrl,
      consumedAt: consumedAtString,
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

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4 gap-4"
      showsVerticalScrollIndicator={false}
    >
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
        <ThemedText className="font-bold">Comsumed At</ThemedText>

        <View className="text-foreground p-4 border border-border rounded-xl bg-muted">
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
    </ScrollView>
  );
}
