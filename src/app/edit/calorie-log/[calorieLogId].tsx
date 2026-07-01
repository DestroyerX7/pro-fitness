import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import {
  CalorieLog,
  createCalorieLogPreset,
  deleteCalorieLog,
  updateCalorieLog,
  uploadToCloudinary,
} from "@/lib/api";
import { fromSqlTimestampToLocalDate, toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { CalorieLogFormValues, calorieLogSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { z } from "zod";

export default function EditCaloireLog() {
  const { calorieLogId } = useLocalSearchParams<{ calorieLogId: string }>();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();

  const calorieLog =
    authData !== null
      ? queryClient
          .getQueryData<CalorieLog[]>(["calorieLogs", authData.user.id])
          ?.find((c) => c.id === calorieLogId)
      : undefined;

  const { control, handleSubmit, formState, setValue } =
    useForm<CalorieLogFormValues>({
      resolver: zodResolver(calorieLogSchema),
      defaultValues: {
        name: calorieLog !== undefined ? calorieLog.name : "",
        calories:
          calorieLog !== undefined ? calorieLog.calories.toString() : "",
        consumedAt:
          calorieLog !== undefined
            ? fromSqlTimestampToLocalDate(calorieLog.consumedAt)
            : new Date(),
        imageUri: calorieLog !== undefined ? calorieLog.imageUrl : "",
      },
    });

  const theme = useTheme();

  const updateCalorieLogMutation = useMutation({
    mutationFn: updateCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const deleteCalorieLogMutation = useMutation({
    mutationFn: deleteCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const createCalorieLogPresetMutation = useMutation({
    mutationFn: createCalorieLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogPresets", calorieLog?.userId],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Bail out of the screen if there's nothing to edit (e.g. stale cache,
  // deep link to a deleted log). Doing this in an effect rather than during
  // render avoids triggering a navigation side effect mid-render.
  useEffect(() => {
    if (authData === null || calorieLog === undefined) {
      router.back();
    }
  }, [authData, calorieLog]);

  if (calorieLog === undefined) {
    return null;
  }

  const handleCreateCalorieLogPreset = () => {
    if (formState.isDirty) {
      Alert.alert(
        "Save changes to create preset",
        "You have unsaved changes. Save them first before you can create preset",
      );

      return;
    }

    createCalorieLogPresetMutation.mutate({
      userId: calorieLog.userId,
      name: calorieLog.name,
      calories: calorieLog.calories,
      imageUrl: calorieLog.imageUrl,
    });
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

    setValue("imageUri", result.assets[0].uri, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
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

    setValue("imageUri", result.assets[0].uri, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleDelete = async () => {
    await Haptics.selectionAsync();

    Alert.alert(
      `Delete ${calorieLog.name}`,
      "Are you sure you want to delete this calorie log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCalorieLogMutation.mutate(calorieLogId, {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert(
                  "Couldn't delete",
                  "Something went wrong while deleting this log. Please try again.",
                ),
            });
          },
        },
      ],
    );
  };

  const onSubmit = async (data: CalorieLogFormValues) => {
    const caloriesNum = Number(data.calories);
    const consumedAtSqlTimestamp = toSqlTimestamp(data.consumedAt);

    // Could maybe use formState.isDirty
    if (
      calorieLog.name === data.name &&
      calorieLog.calories === caloriesNum &&
      calorieLog.consumedAt === consumedAtSqlTimestamp &&
      calorieLog.imageUrl === data.imageUri
    ) {
      return;
    }

    const imageUrl =
      data.imageUri === null
        ? null
        : z.url({ protocol: /^https?$/ }).safeParse(data.imageUri).success
          ? data.imageUri
          : await uploadToCloudinary(data.imageUri);

    updateCalorieLogMutation.mutate(
      {
        name: data.name,
        calories: caloriesNum,
        consumedAt: consumedAtSqlTimestamp,
        imageUrl,
        calorieLogId,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert(
            "Couldn't save",
            "Something went wrong while saving this log. Please try again.",
          ),
      },
    );
  };

  const isSaving = formState.isSubmitting || updateCalorieLogMutation.isPending;
  const isDeleting = deleteCalorieLogMutation.isPending;
  const hasUnsavedChanges = formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              className="p-2 justify-center items-center flex-row gap-2"
              disabled={createCalorieLogPresetMutation.isPending}
              onPress={handleCreateCalorieLogPreset}
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="p-4 gap-6"
          showsVerticalScrollIndicator={false}
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
              <ThemedText className="text-sm font-medium">
                Add an image
              </ThemedText>

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
                  onPress={() =>
                    setValue("name", label, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
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
                  className={
                    formState.errors.calories ? "border-destructive" : ""
                  }
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

          {/* Save */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className={cn(
              "items-center rounded-xl bg-primary p-4 active:opacity-80",
              isSaving || !hasUnsavedChanges ? "opacity-50" : "",
            )}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <ThemedText className="font-semibold text-primary-foreground">
              {isSaving ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>

          {/* Delete */}
          <Pressable
            className="p-4 rounded-xl bg-muted flex-row items-center justify-center gap-2 active:opacity-80"
            disabled={isDeleting}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons
              name="trash-can"
              size={16}
              color={theme.destructive}
            />

            <ThemedText className="text-destructive font-semibold">
              {isDeleting ? "Deleting..." : "Delete"}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
