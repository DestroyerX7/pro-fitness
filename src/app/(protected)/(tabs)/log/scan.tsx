import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import { createNutritionLog, uploadToCloudinary } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/nativewind";
import { ScanFormValues, scanSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
        numberOfServings: "",
        consumedAt: new Date(),
        imageUri: null,
      },
    });

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const createNutritionLogMutation = useMutation({
    mutationFn: createNutritionLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.nutritionLogs.all(user.id),
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
      setError("Product not found, try again.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
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

  const onSubmit = async (data: ScanFormValues) => {
    const caloriesPerServingNum = Number(data.caloriesPerServing);
    const numberOfServingsNum = Number(data.numberOfServings);
    const calories = Math.ceil(caloriesPerServingNum * numberOfServingsNum);
    const consumedAtSqlTimestamp = toSqlTimestamp(data.consumedAt);

    const imageUrl =
      data.imageUri === null
        ? null
        : z.url({ protocol: /^https?$/ }).safeParse(data.imageUri).success
          ? data.imageUri
          : await uploadToCloudinary(data.imageUri);

    createNutritionLogMutation.mutate({
      userId: user.id,
      name: data.name,
      calories,
      imageUrl,
      consumedAt: consumedAtSqlTimestamp,
    });
  };

  const rescan = () => {
    setProduct(null);
    setError(null);
    setIsLoading(false);
    isLoadingRef.current = false;

    reset();
  };

  if (status === null) {
    return;
  }

  if (!status.granted) {
    return (
      <View className="flex-1 justify-center items-center gap-4">
        <ThemedText className="text-xl font-semibold">
          We need camera permission
        </ThemedText>

        <Pressable
          className="p-4 bg-primary rounded-xl active:opacity-80"
          onPress={requestPermission}
        >
          <ThemedText>Grant Permission</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (error !== null) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-6"
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

        <View className="flex-row gap-2 items-center justify-center">
          <MaterialIcons name="error" size={32} color={theme.foreground} />

          <ThemedText className="text-2xl">{error}</ThemedText>
        </View>
      </ScrollView>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <AntDesign
          // className="animate-spin"
          name="loading-3-quarters"
          size={64}
          color={theme.foreground}
        />

        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (product === null) {
    return (
      <CameraView
        className=" flex-1"
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
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-6"
        showsVerticalScrollIndicator={false}
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
                className={formState.errors.name ? "border-destructive" : ""}
              />
            )}
          />

          {formState.errors.name && (
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
              <View className="text-foreground px-2 py-1 border border-border rounded-xl bg-muted">
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
                    formState.errors.caloriesPerServing
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.caloriesPerServing && (
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
              name="numberOfServings"
              render={({ field }) => (
                <ThemedTextInput
                  placeholder="Number of servings"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholderTextColor={theme.mutedForeground}
                  className={
                    formState.errors.numberOfServings
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.numberOfServings && (
              <ThemedText className="text-xs text-destructive">
                {formState.errors.numberOfServings.message}
              </ThemedText>
            )}
          </View>
        </View>

        <Pressable
          className="bg-primary p-4 rounded-xl active:opacity-80"
          onPress={handleSubmit(onSubmit)}
        >
          <ThemedText className="text-primary-foreground text-center font-semibold">
            Log Calories
          </ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
