import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { UserFormValues, userSchema } from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { z } from "zod";

export default function EditUser() {
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, formState, setValue } =
    useForm<UserFormValues>({
      resolver: zodResolver(userSchema),
      defaultValues: {
        name: user.name,
        dailyCalorieGoal: user.dailyCalorieGoal.toString(),
        dailyWorkoutGoal: user.dailyWorkoutGoal.toString(),
        imageUri: user.image,
      },
    });

  const theme = useTheme();

  const handleDeleteUser = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to permanently delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const result = await authClient.deleteUser({
              callbackURL: "/(auth)",
            });

            if (result.error !== null) {
              Alert.alert(
                result.error.message ??
                  "Something went wrong, please try again",
              );

              return;
            }

            await authClient.signOut();
          },
          style: "destructive",
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

  const onSubmit = async (data: UserFormValues) => {
    const dailyCalorieGoalNum = Number(data.dailyCalorieGoal);
    const dailyWorkoutGoalNum = Number(data.dailyWorkoutGoal);

    // Could maybe use formState.isDirty
    if (
      user.name === data.name &&
      user.dailyCalorieGoal === dailyCalorieGoalNum &&
      user.dailyWorkoutGoal === dailyWorkoutGoalNum &&
      user.image === data.imageUri
    ) {
      return;
    }

    const imageUrl =
      data.imageUri === null
        ? null
        : z.httpUrl().safeParse(data.imageUri).success
          ? data.imageUri
          : await uploadToCloudinary(data.imageUri);

    authClient.updateUser({
      name: data.name,
      image: imageUrl,
      dailyCalorieGoal: dailyCalorieGoalNum,
      dailyWorkoutGoal: dailyCalorieGoalNum,
      fetchOptions: {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert(
            "Couldn't save",
            "Something went wrong while saving. Please try again.",
          ),
      },
    });
  };

  const isSaving = formState.isSubmitting;
  const hasUnsavedChanges = formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          title: user.email,
        }}
      />

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
              <View className="relative">
                <Pressable onPress={pickImage}>
                  {field.value !== null ? (
                    <Image
                      source={{ uri: field.value }}
                      style={{ width: 192, aspectRatio: 1, borderRadius: 96 }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={192}
                      color={theme.foreground}
                    />
                  )}
                </Pressable>

                {field.value !== null && (
                  <Pressable
                    onPress={() => field.onChange(null)}
                    hitSlop={8}
                    className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-destructive shadow active:opacity-80"
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
              Change profile image
            </ThemedText>

            <ThemedText className="text-xs text-muted-foreground">
              Tap to select an image
            </ThemedText>
          </View>
        </View>

        {/* Name */}
        <View className="gap-2">
          <ThemedText className="font-medium text-sm">Name</ThemedText>

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
        </View>

        <View className="gap-2">
          <ThemedText className="font-medium text-sm">
            Daily Calorie Goal
          </ThemedText>

          <Controller
            control={control}
            name="dailyCalorieGoal"
            render={({ field }) => (
              <ThemedTextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Daily calorie goal"
                placeholderTextColor={theme.mutedForeground}
                className={
                  formState.errors.dailyCalorieGoal !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.dailyCalorieGoal !== undefined && (
            <ThemedText className="text-xs text-destructive">
              {formState.errors.dailyCalorieGoal.message}
            </ThemedText>
          )}
        </View>

        <View className="gap-2">
          <ThemedText className="font-medium text-sm">
            Daily Workout Goal
          </ThemedText>

          <Controller
            control={control}
            name="dailyWorkoutGoal"
            render={({ field }) => (
              <ThemedTextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Daily workout goal"
                placeholderTextColor={theme.mutedForeground}
                className={
                  formState.errors.dailyWorkoutGoal !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.dailyWorkoutGoal !== undefined && (
            <ThemedText className="text-xs text-destructive">
              {formState.errors.dailyWorkoutGoal.message}
            </ThemedText>
          )}
        </View>

        <View className="gap-4">
          {/* Save */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className={cn(
              "h-12 items-center justify-center rounded-xl bg-primary active:opacity-80",
              isSaving || !hasUnsavedChanges ? "opacity-50" : "",
            )}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <ThemedText className="font-semibold text-primary-foreground">
              {isSaving ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>

          <Pressable
            className="h-12 items-center justify-center bg-foreground rounded-xl flex-row gap-2 border active:opacity-80"
            onPress={async () => await authClient.signOut()}
          >
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={theme.background}
            />

            <ThemedText className="text-background">Log out</ThemedText>
          </Pressable>

          <Pressable
            className="h-12 items-center justify-center bg-muted rounded-xl flex-row gap-2 active:opacity-80"
            onPress={handleDeleteUser}
          >
            <MaterialCommunityIcons
              name="trash-can"
              size={24}
              color={theme.destructive}
            />

            <ThemedText className="text-destructive">Delete Account</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
