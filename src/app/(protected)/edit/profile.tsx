import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import useDailyTarget from "@/hooks/useDailyTarget";
import { useImagePicker } from "@/hooks/useImagePicker";
import useTheme from "@/hooks/useTheme";
import { DailyTarget, updateDailyTarget, uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { ProfileFormValues, profileSchema } from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { z } from "zod";

function ProfileForm({ dailyTarget }: { dailyTarget: DailyTarget }) {
  const { user } = useAuthenticatedAuth();
  const queryClient = useQueryClient();

  const { control, handleSubmit, formState, setValue } =
    useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        name: user.name,
        dailyCalorieTarget: dailyTarget.calorieTarget.toString(),
        dailyWorkoutMinutesTarget: dailyTarget.workoutMinutesTarget.toString(),
        imageUri: user.image,
      },
    });

  const theme = useTheme();

  const updateDailyTargetMutation = useMutation({
    mutationFn: updateDailyTarget,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyTarget.byUser(user.id),
      }),
  });

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
            const { error } = await authClient.deleteUser();

            if (error !== null) {
              Alert.alert(
                error.message ?? "Something went wrong. Please try again.",
              );

              return;
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const { pickImage } = useImagePicker((uri) =>
    setValue("imageUri", uri, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    }),
  );

  const onSubmit = async ({
    name,
    dailyCalorieTarget,
    dailyWorkoutMinutesTarget,
    imageUri,
  }: ProfileFormValues) => {
    if (!formState.isDirty) {
      return;
    }

    const tasks: Promise<unknown>[] = [];

    if (
      formState.dirtyFields.name !== undefined ||
      formState.dirtyFields.imageUri !== undefined
    ) {
      tasks.push(
        (async () => {
          const imageUrl =
            imageUri === null
              ? null
              : z.httpUrl().safeParse(imageUri).success
                ? imageUri
                : await uploadToCloudinary(imageUri);

          const { error } = await authClient.updateUser({
            name,
            image: imageUrl,
          });

          if (error !== null) {
            throw error;
          }
        })(),
      );
    }

    if (
      formState.dirtyFields.dailyCalorieTarget !== undefined ||
      formState.dirtyFields.dailyWorkoutMinutesTarget !== undefined
    ) {
      tasks.push(
        updateDailyTargetMutation.mutateAsync({
          calorieTarget: Number(dailyCalorieTarget),
          workoutMinutesTarget: Number(dailyWorkoutMinutesTarget),
        }),
      );
    }

    const results = await Promise.allSettled(tasks);
    const hasError = results.some((r) => r.status === "rejected");

    if (hasError) {
      Alert.alert("Couldn't save", "Please try again.");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      return;
    }

    router.back();
  };

  const canSave = !formState.isSubmitting && formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          title: user.email,
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
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
            Daily Calorie Target
          </ThemedText>

          <Controller
            control={control}
            name="dailyCalorieTarget"
            render={({ field }) => (
              <ThemedTextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Daily calorie target"
                className={
                  formState.errors.dailyCalorieTarget !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.dailyCalorieTarget !== undefined && (
            <ThemedText className="text-xs text-destructive">
              {formState.errors.dailyCalorieTarget.message}
            </ThemedText>
          )}
        </View>

        <View className="gap-2">
          <ThemedText className="font-medium text-sm">
            Daily Workout Target
          </ThemedText>

          <Controller
            control={control}
            name="dailyWorkoutMinutesTarget"
            render={({ field }) => (
              <ThemedTextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Daily workout target"
                className={
                  formState.errors.dailyWorkoutMinutesTarget !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.dailyWorkoutMinutesTarget !== undefined && (
            <ThemedText className="text-xs text-destructive">
              {formState.errors.dailyWorkoutMinutesTarget.message}
            </ThemedText>
          )}
        </View>

        <View className="gap-4">
          {/* Save */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className={cn(
              "p-4 items-center justify-center rounded-xl bg-primary active:opacity-80",
              !canSave && "opacity-50",
            )}
            disabled={!canSave}
          >
            {formState.isSubmitting ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <ThemedText className="font-semibold text-primary-foreground">
                Save
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            className="p-4 items-center justify-center bg-foreground rounded-xl flex-row gap-1 border active:opacity-80"
            onPress={async () => await authClient.signOut()}
          >
            <MaterialCommunityIcons
              name="logout"
              size={16}
              color={theme.background}
            />

            <ThemedText className="text-background font-semibold">
              Log out
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 items-center justify-center bg-muted rounded-xl flex-row gap-1 active:opacity-80"
            onPress={handleDeleteUser}
          >
            <MaterialCommunityIcons
              name="trash-can"
              size={16}
              color={theme.destructive}
            />

            <ThemedText className="text-destructive font-semibold">
              Delete Account
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

export default function EditUser() {
  const { user } = useAuthenticatedAuth();
  const { data: dailyTarget, isPending } = useDailyTarget(user.id);

  const theme = useTheme();

  useEffect(() => {
    if (!isPending && dailyTarget === undefined) {
      router.back();
    }
  }, [isPending, dailyTarget]);

  if (dailyTarget === undefined) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <ActivityIndicator size="large" color={theme.foreground} />

        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return <ProfileForm dailyTarget={dailyTarget} />;
}
