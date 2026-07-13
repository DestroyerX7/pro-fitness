import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import { useImagePicker } from "@/hooks/useImagePicker";
import useTheme from "@/hooks/useTheme";
import { createNutritionLog, uploadToCloudinary } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/nativewind";
import { ScanFormValues, scanSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
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
import { z } from "zod";

type Product = {
  code: string;
  product_name?: string;
  nutriments: {
    "energy-kcal_serving"?: number;
  };
  image_url?: string;
};

export default function Scan() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const [status, requestPermission] = useCameraPermissions();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const { control, handleSubmit, setValue, formState, reset } =
    useForm<ScanFormValues>({
      resolver: zodResolver(scanSchema),
      defaultValues: {
        name: "",
        caloriesPerServing: "",
        numServings: "",
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

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (isLoadingRef.current || product !== null) {
      return;
    }

    lookupBarcode(scanningResult.data);
  };

  const lookupBarcode = async (barcode: string) => {
    try {
      if (isLoadingRef.current || product !== null) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      const response = await axios.get<{ product: Product }>(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}`,
      );

      const { product_name, nutriments, image_url } = response.data.product;

      setProduct(response.data.product);
      setValue("name", product_name ?? "", { shouldValidate: true });
      setValue(
        "caloriesPerServing",
        Math.ceil(nutriments["energy-kcal_serving"] ?? 0).toString(),
        { shouldValidate: true },
      );
      setValue("imageUri", image_url ?? null, { shouldValidate: true });
    } catch {
      setError("Product not found, try again or log munually.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
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
    consumedAt,
    caloriesPerServing,
    numServings,
    imageUri,
  }: ScanFormValues) => {
    try {
      const caloriesPerServingNum = Number(caloriesPerServing);
      const numServingsNum = Number(numServings);
      const calories = Math.ceil(caloriesPerServingNum * numServingsNum);

      const imageUrl =
        imageUri === null
          ? null
          : z.httpUrl().safeParse(imageUri).success
            ? imageUri
            : await uploadToCloudinary(imageUri);

      await createNutritionLogMutation.mutateAsync({
        userId: user.id,
        name,
        calories,
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

  const rescan = () => {
    setProduct(null);
    setError(null);
    setIsLoading(false);
    isLoadingRef.current = false;

    reset();
  };

  if (status === null || !status.granted) {
    return (
      <View className="flex-1 justify-center items-center gap-4">
        <ThemedText className="text-xl font-semibold">
          We need camera permission
        </ThemedText>

        <Pressable
          className="p-4 bg-primary rounded-xl active:opacity-80"
          onPress={requestPermission}
        >
          <ThemedText className="text-primary-foreground">
            Grant Permission
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (error !== null) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          className="bg-secondary p-4 rounded-xl flex-row items-center justify-center gap-1 active:opacity-80"
          onPress={rescan}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={16}
            color={theme.primaryForeground}
          />

          <ThemedText className="text-primary-foreground text-center text-lg font-semibold">
            Rescan
          </ThemedText>
        </Pressable>

        <View className="p-4 gap-4 items-center">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-2xl text-center w-3/4">
            {error}
          </ThemedText>

          <Pressable
            className="bg-secondary p-4 rounded-xl active:opacity-80"
            onPress={() => router.replace("/(protected)/(tabs)/log/nutrition")}
          >
            <ThemedText className="text-secondary-foreground">
              Log calories
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <ActivityIndicator size="large" color={theme.foreground} />

        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (product === null) {
    return (
      <CameraView
        className="flex-1"
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13", // most food products
            "ean8",
            "upc_a",
            "upc_e",
          ],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          className="bg-secondary p-4 rounded-xl flex-row items-center justify-center gap-1 active:opacity-80"
          onPress={rescan}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={16}
            color={theme.secondaryForeground}
          />

          <ThemedText className="text-secondary-foreground text-center font-semibold">
            Rescan
          </ThemedText>
        </Pressable>

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
                placeholder="Name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
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

        {/* Consumed at */}
        <View className="gap-2">
          <ThemedText className="text-sm font-medium">Consumed at</ThemedText>

          <Controller
            control={control}
            name="consumedAt"
            render={({ field }) => (
              <View className="text-foreground p-1.5 border border-border rounded-xl bg-muted">
                <DateTimePicker
                  value={field.value}
                  mode="datetime"
                  onValueChange={(_, selectedDate) => {
                    field.onChange(selectedDate);
                  }}
                />
              </View>
            )}
          />
        </View>

        {/* Calories per serving */}
        <View className="flex-row gap-4 items-start">
          <View className="gap-2 flex-1">
            <ThemedText className="text-sm font-medium">
              Calories per serving
            </ThemedText>

            <Controller
              control={control}
              name="caloriesPerServing"
              render={({ field }) => (
                <ThemedTextInput
                  placeholder="Calories per serving"
                  keyboardType="number-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholderTextColor={theme.mutedForeground}
                  className={
                    formState.errors.caloriesPerServing !== undefined
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.caloriesPerServing !== undefined && (
              <ThemedText className="text-xs text-destructive">
                {formState.errors.caloriesPerServing.message}
              </ThemedText>
            )}
          </View>

          {/* Number of servings */}
          <View className="gap-2 flex-1">
            <ThemedText className="text-sm font-medium">
              Number of servings
            </ThemedText>

            <Controller
              control={control}
              name="numServings"
              render={({ field }) => (
                <ThemedTextInput
                  placeholder="Number of servings"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholderTextColor={theme.mutedForeground}
                  className={
                    formState.errors.numServings !== undefined
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.numServings !== undefined && (
              <ThemedText className="text-xs text-destructive">
                {formState.errors.numServings.message}
              </ThemedText>
            )}
          </View>
        </View>

        <Pressable
          className={cn(
            "bg-primary p-4 rounded-xl active:opacity-80",
            formState.isSubmitting && "opacity-50",
          )}
          onPress={handleSubmit(onSubmit)}
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <ActivityIndicator color={theme.primaryForeground} />
          ) : (
            <ThemedText className="text-primary-foreground text-center font-semibold">
              Log Calories
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
