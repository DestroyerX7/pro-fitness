import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { createCalorieLog, uploadToCloudinary } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/nativewind";
import { CalorieLogFormValues, calorieLogSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Calories() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, setValue, formState } =
    useForm<CalorieLogFormValues>({
      resolver: zodResolver(calorieLogSchema),
      defaultValues: {
        name: "",
        calories: "",
        consumedAt: new Date(),
        imageUri: null,
      },
    });

  const [logging, setLogging] = useState(false);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const createCalorieLogMutation = useMutation({
    mutationFn: createCalorieLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", user.id],
      });

      Toast.show({
        type: "loggedCalories",
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
    onSettled: () => setLogging(false),
  });

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

    setValue("imageUri", result.assets[0].uri, { shouldValidate: true });
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

    setValue("imageUri", result.assets[0].uri, { shouldValidate: true });
  };

  const onSubmit = async (data: CalorieLogFormValues) => {
    setLogging(true);

    const caloriesNum = Number(data.calories);
    const imageUrl =
      data.imageUri !== null ? await uploadToCloudinary(data.imageUri) : null;
    const consumedAtSqlTimestamp = toSqlTimestamp(data.consumedAt);

    createCalorieLogMutation.mutate({
      userId: user.id,
      name: data.name,
      calories: caloriesNum,
      imageUrl,
      consumedAt: consumedAtSqlTimestamp,
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="p-4 gap-6"
    >
      {/* Image picker */}
      <View className="items-center gap-2">
        <Controller
          control={control}
          name="imageUri"
          render={({ field }) => (
            <View className="relative h-48 w-48">
              <Pressable
                onPress={pickImage}
                className={cn(
                  "flex-1 items-center justify-center overflow-hidden rounded-2xl",
                  field.value !== null
                    ? "border border-transparent"
                    : "border border-dashed border-border bg-muted",
                )}
              >
                {field.value !== null ? (
                  <Image
                    source={{ uri: field.value }}
                    style={{ flex: 1, width: "100%" }}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="camera"
                    size={48}
                    color={theme.mutedForeground}
                  />
                )}
              </Pressable>

              {field.value !== null && (
                <Pressable
                  onPress={() => field.onChange(null)}
                  hitSlop={8}
                  className="absolute -right-3 -top-3 h-8 w-8 items-center justify-center rounded-full bg-destructive shadow active:opacity-80"
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={16}
                    color={theme.destructiveForeground}
                  />
                </Pressable>
              )}
            </View>
          )}
        />

        <View className="items-center">
          <ThemedText className="text-sm font-medium">Add an image</ThemedText>

          <ThemedText className="text-xs text-muted-foreground">
            Tap to select an image
          </ThemedText>
        </View>
      </View>

      {/* Name */}
      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Name</ThemedText>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <ThemedTextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Name"
              placeholderTextColor={theme.mutedForeground}
              className={formState.errors.name ? "border-destructive" : ""}
            />
          )}
        />

        {formState.errors.name && (
          <ThemedText className="text-xs text-destructive">
            {formState.errors.name.message}
          </ThemedText>
        )}

        <View className="flex-row flex-wrap gap-2">
          {[
            "Breakfast",
            "Lunch",
            "Dinner",
            "Snack",
            "Pre-workout",
            "Post-workout",
          ].map((label) => (
            <Pressable
              key={label}
              onPress={() => setValue("name", label, { shouldValidate: true })}
              className="rounded-full border border-border bg-muted px-3 py-2 active:opacity-80"
            >
              <ThemedText className="text-sm">{label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Calories */}
      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Calories</ThemedText>

        <Controller
          control={control}
          name="calories"
          render={({ field }) => (
            <ThemedTextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Calories"
              placeholderTextColor={theme.mutedForeground}
              keyboardType="number-pad"
              className={formState.errors.calories ? "border-destructive" : ""}
            />
          )}
        />

        {formState.errors.calories && (
          <ThemedText className="text-xs text-destructive">
            {formState.errors.calories.message}
          </ThemedText>
        )}
      </View>

      {/* Consumed At */}
      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Consumed at</ThemedText>

        <Controller
          control={control}
          name="consumedAt"
          render={({ field: { value, onChange } }) => (
            <View className="rounded-xl border border-border bg-muted px-2 py-1">
              <DateTimePicker
                value={value}
                mode="datetime"
                onValueChange={(_, selectedDate) => onChange(selectedDate)}
              />
            </View>
          )}
        />
      </View>

      {/* Log Calories */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        className="items-center rounded-xl bg-primary p-4 active:opacity-80"
        disabled={logging}
      >
        <ThemedText className="font-semibold text-primary-foreground">
          {logging ? "Logging..." : "Log Calories"}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}
