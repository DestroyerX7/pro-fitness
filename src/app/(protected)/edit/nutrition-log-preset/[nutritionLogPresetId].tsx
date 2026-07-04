import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import {
  NutritionLogPreset,
  deleteNutritionLogPreset,
  getNutritionLogPreset,
  updateNutritionLogPreset,
  uploadToCloudinary,
} from "@/lib/api";
import { cn } from "@/lib/nativewind";
import {
  NutritionLogPresetFormValues,
  nutritionLogPresetSchema,
} from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
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

function NutritionLogPresetForm({
  nutritionLogPreset,
}: {
  nutritionLogPreset: NutritionLogPreset;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, formState, setValue } =
    useForm<NutritionLogPresetFormValues>({
      resolver: zodResolver(nutritionLogPresetSchema),
      defaultValues: {
        name: nutritionLogPreset.name,
        calories: nutritionLogPreset.calories.toString(),
        imageUri: nutritionLogPreset.imageUrl,
      },
    });

  const theme = useTheme();

  const updateNutritionLogPresetMutation = useMutation({
    mutationFn: updateNutritionLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.nutritionLogPresets.all(user.id),
      });
    },
  });

  const deleteNutritionLogPresetMutation = useMutation({
    mutationFn: deleteNutritionLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.nutritionLogPresets.all(user.id),
      });
    },
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
      `Delete ${nutritionLogPreset.name}`,
      "Are you sure you want to delete this nutrition log preset?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNutritionLogPresetMutation.mutate(nutritionLogPreset.id, {
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

  const onSubmit = async (data: NutritionLogPresetFormValues) => {
    const caloriesNum = Number(data.calories);

    // Could maybe use formState.isDirty
    if (
      nutritionLogPreset.name === data.name &&
      nutritionLogPreset.calories === caloriesNum &&
      nutritionLogPreset.imageUrl === data.imageUri
    ) {
      return;
    }

    const imageUrl =
      data.imageUri === null
        ? null
        : z.httpUrl().safeParse(data.imageUri).success
          ? data.imageUri
          : await uploadToCloudinary(data.imageUri);

    updateNutritionLogPresetMutation.mutate(
      {
        name: data.name,
        calories: caloriesNum,
        imageUrl,
        nutritionLogPresetId: nutritionLogPreset.id,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert(
            "Couldn't save",
            "Something went wrong while saving this preset. Please try again.",
          ),
      },
    );
  };

  const isSaving =
    formState.isSubmitting || updateNutritionLogPresetMutation.isPending;
  const isDeleting = deleteNutritionLogPresetMutation.isPending;
  const hasUnsavedChanges = formState.isDirty;

  return (
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
                className={
                  formState.errors.name !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.name !== undefined && (
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
                  formState.errors.calories !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.calories !== undefined && (
            <ThemedText className="text-xs text-destructive">
              {formState.errors.calories.message}
            </ThemedText>
          )}
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
  );
}

export default function EditCaloireLogPreset() {
  const { nutritionLogPresetId } = useLocalSearchParams<{
    nutritionLogPresetId: string;
  }>();
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { data: nutritionLogPreset, isPending } = useQuery({
    queryKey: queryKeys.nutritionLogPresets.one(user.id, nutritionLogPresetId),
    queryFn: () => getNutritionLogPreset(nutritionLogPresetId),
    initialData: () =>
      queryClient
        .getQueryData<NutritionLogPreset[]>(
          queryKeys.nutritionLogPresets.all(user.id),
        )
        ?.find((c) => c.id === nutritionLogPresetId),
    initialDataUpdatedAt: queryClient.getQueryState(
      queryKeys.nutritionLogPresets.all(user.id),
    )?.dataUpdatedAt,
  });

  useEffect(() => {
    if (!isPending && nutritionLogPreset === undefined) {
      router.back();
    }
  }, [isPending, nutritionLogPreset]);

  if (nutritionLogPreset === undefined) {
    return;
  }

  return <NutritionLogPresetForm nutritionLogPreset={nutritionLogPreset} />;
}
