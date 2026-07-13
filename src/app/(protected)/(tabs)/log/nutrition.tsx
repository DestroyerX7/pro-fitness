import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import { useImagePicker } from "@/hooks/useImagePicker";
import useTheme from "@/hooks/useTheme";
import { createNutritionLog, uploadToCloudinary } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/nativewind";
import { NutritionLogFormValues, nutritionLogSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Nutrition() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, setValue, formState } =
    useForm<NutritionLogFormValues>({
      resolver: zodResolver(nutritionLogSchema),
      defaultValues: {
        name: "",
        calories: "",
        consumedAt: new Date(),
        imageUri: null,
      },
    });

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const createNutritionLogMutation = useMutation({
    mutationFn: createNutritionLog,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.nutritionLogs.all(user.id),
      }),
  });

  const { pickImage } = useImagePicker((uri) =>
    setValue("imageUri", uri, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    }),
  );

  const onSubmit = async ({
    name,
    calories,
    imageUri,
    consumedAt,
  }: NutritionLogFormValues) => {
    try {
      const imageUrl =
        imageUri !== null ? await uploadToCloudinary(imageUri) : null;

      await createNutritionLogMutation.mutateAsync({
        userId: user.id,
        name,
        calories: Number(calories),
        imageUrl,
        consumedAt: toSqlTimestamp(consumedAt),
      });

      Toast.show({
        type: "loggedCalories",
        text1: "Logged!",
        text2: `${name} • ${calories} cal`,
        topOffset: insets.top + 16,
        onPress: () =>
          router.push({
            pathname: "/(protected)/(tabs)/home",
            params: { tab: "nutrition" },
          }),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't log calories",
        text2: error instanceof Error ? error.message : "Please try again.",
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 gap-4"
        keyboardShouldPersistTaps="handled"
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
                    field.value === null &&
                      "border border-dashed border-border bg-muted",
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

        {/* Consumed At */}
        <View className="gap-2">
          <ThemedText className="text-sm font-medium">Consumed at</ThemedText>

          <Controller
            control={control}
            name="consumedAt"
            render={({ field: { value, onChange } }) => (
              <View className="rounded-xl border border-border bg-muted p-1.5">
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
          className={cn(
            "items-center rounded-xl bg-primary p-4 active:opacity-80",
            formState.isSubmitting && "opacity-50",
          )}
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <ActivityIndicator color={theme.primaryForeground} />
          ) : (
            <ThemedText className="font-semibold text-primary-foreground">
              Log Calories
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
