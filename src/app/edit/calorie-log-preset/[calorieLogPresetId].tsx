import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { CalorieLogPreset, deleteCalorieLogPreset } from "@/lib/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen() {
  const { calorieLogPresetId } = useLocalSearchParams<{
    calorieLogPresetId: string;
  }>();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const calorieLogPreset =
    authData !== null
      ? queryClient
          .getQueryData<CalorieLogPreset[]>([
            "calorieLogPresets",
            authData.user.id,
          ])
          ?.find((c) => c.id === calorieLogPresetId)
      : undefined;

  const [image, setImage] = useState<string | null>(
    calorieLogPreset?.imageUrl ?? null,
  );

  const deleteCalorieLogPresetMutation = useMutation({
    mutationFn: deleteCalorieLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogPresets", authData?.user.id],
      });
    },
  });

  const handleCancel = () => {
    router.back();
  };

  if (calorieLogPreset === undefined) {
    return;
  }

  const handleDelete = async () => {
    await Haptics.selectionAsync();

    Alert.alert(
      `Delete ${calorieLogPreset.name}`,
      "Are you sure you want to delete this calorie log preset?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCalorieLogPresetMutation.mutate(calorieLogPresetId, {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert(
                  "Couldn't delete",
                  "Something went wrong while deleting this preset. Please try again.",
                ),
            });
          },
        },
      ],
    );
  };

  const pickImage = async () => {
    Alert.alert("Select Image", "Choose an option", [
      {
        text: "Take Photo",
        onPress: () => openCamera(),
      },
      {
        text: "Choose from Library",
        onPress: () => openLibrary(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    setImage(result.assets[0].uri);
  };

  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Photo library access is needed to select an image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    setImage(result.assets[0].uri);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable hitSlop={8} onPress={handleCancel}>
              <MaterialCommunityIcons
                name="close"
                color={theme.foreground}
                size={24}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 gap-4"
      >
        <View className="items-center">
          <Pressable
            onPress={pickImage}
            className="w-32 aspect-square relative"
          >
            {image !== null ? (
              <Image
                source={{ uri: image }}
                style={{ flex: 1, borderRadius: 16 }}
              />
            ) : (
              <View className="flex-1 border rounded-xl border-border items-center justify-center bg-muted">
                <MaterialCommunityIcons
                  name="food"
                  size={64}
                  color={theme.foreground}
                />
              </View>
            )}

            <Pressable className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-foreground border border-border shadow-sm items-center justify-center">
              <MaterialCommunityIcons
                name="camera"
                size={16}
                color={theme.background}
              />
            </Pressable>
          </Pressable>
        </View>

        <View className="gap-1">
          <ThemedText className="font-bold">Name</ThemedText>

          <ThemedTextInput placeholder="Name" value={calorieLogPreset.name} />
        </View>

        <View className="gap-1">
          <ThemedText className="font-bold">Calories</ThemedText>

          <ThemedTextInput
            placeholder="Calories"
            value={calorieLogPreset.calories.toString()}
            keyboardType="number-pad"
          />
        </View>

        <Pressable className="items-center bg-primary p-4 rounded-xl">
          <ThemedText className="text-primary-foreground text-xl">
            Save
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="flex-row gap-1 items-center justify-center p-4 rounded-xl"
        >
          <MaterialCommunityIcons
            name="trash-can"
            color={theme.destructive}
            size={24}
          />

          <ThemedText className="text-destructive text-xl">Delete</ThemedText>
        </Pressable>
      </ScrollView>
    </>
  );
}
