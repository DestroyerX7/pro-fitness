import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { BarcodeScanningResult, CameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import { useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";

type GetProductByBarcodeResponse = {
  product: Product;
};

type Product = {
  code: string;
  product_name?: string;
  serving_size?: string;
  nutriments: {
    "energy-kcal_100g"?: number;
    "energy-kcal_serving"?: number;
  };
  image_url?: string;
};

export default function Scan() {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const [name, setName] = useState("");
  const [caloriesPerServing, setCaloriesPerServing] = useState("");
  const [numberOfServings, setNumberOfServings] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

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

      const response: { data: GetProductByBarcodeResponse } = await axios.get(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}`,
      );

      const { code, product_name, nutriments, serving_size, image_url } =
        response.data.product;

      console.log({
        code,
        product_name,
        energy_kcal_per_serving: nutriments["energy-kcal_serving"],
        energy_kcal_100g: nutriments["energy-kcal_100g"],
        serving_size,
        image_url,
      });

      setProduct(response.data.product);
      setName(product_name || "");
      setCaloriesPerServing(
        Math.round(nutriments["energy-kcal_serving"] || 0).toString(),
      );
      setImageUrl(image_url || null);
    } catch (error) {
      setError("Product not found, try again.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  const logCalories = async () => {
    const trimmedName = name.trim();
    const caloriesPerServingNum = Number(caloriesPerServing);
    const numberOfServingsNum = Number(numberOfServings);

    if (
      trimmedName.length < 1 ||
      caloriesPerServingNum < 1 ||
      numberOfServingsNum < 1
    ) {
      return;
    }

    await axios.post(`${baseUrl}/api/log-calories`, {
      userId: data?.user.id,
      name: trimmedName,
      calories: caloriesPerServingNum * numberOfServingsNum,
      imageUrl,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const rescan = () => {
    setProduct(null);
    setError(null);
    setIsLoading(false);
    isLoadingRef.current = false;

    setNumberOfServings("");
  };

  if (error !== null) {
    return (
      <View className="p-4 gap-4">
        <Pressable
          className="bg-secondaryForeground p-4 rounded-full flex-row items-center justify-center gap-2"
          onPress={rescan}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={theme.primaryForeground}
          />

          <ThemedText
            color="text-primary-foreground"
            className="text-center text-lg font-bold"
          >
            Rescan
          </ThemedText>
        </Pressable>

        <View className="flex-row gap-2 items-center justify-center">
          <MaterialIcons name="error" size={32} color={theme.foreground} />
          <ThemedText className="text-2xl">{error}</ThemedText>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <AntDesign
          className="animate-spin"
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
    <View className="p-4 gap-4">
      <Pressable
        className="bg-secondary p-4 rounded-full flex-row items-center justify-center gap-2"
        onPress={rescan}
      >
        <MaterialCommunityIcons
          name="refresh"
          size={24}
          color={theme.secondaryForeground}
        />

        <ThemedText
          color="text-secondary-foreground"
          className="text-center text-lg font-bold"
        >
          Rescan
        </ThemedText>
      </Pressable>

      {imageUrl !== null ? (
        <Image
          className="h-64"
          style={{ objectFit: "contain" }}
          source={{
            uri: imageUrl,
          }}
        />
      ) : (
        <View className="items-center border border-border p-4 rounded-xl h-64 justify-center">
          <MaterialCommunityIcons
            name="image"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="font-bold text-2xl">
            Product image not found
          </ThemedText>

          <ThemedText color="text-muted-foreground">
            Tap to take your own picture
          </ThemedText>
        </View>
      )}

      {/* Work on border above */}

      <View className="gap-1">
        <ThemedText className="font-bold">Name</ThemedText>

        <ThemedTextInput
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Date</ThemedText>

        <ThemedTextInput
          placeholder="Date"
          value={new Date().toLocaleDateString()}
        />
      </View>

      <View className="flex-row gap-4 items-end">
        <View className="gap-1 flex-1">
          <ThemedText className="font-bold">Calories per serving</ThemedText>

          <ThemedTextInput
            placeholder="Calories per serving"
            keyboardType="number-pad"
            value={caloriesPerServing}
            onChangeText={(text) => setCaloriesPerServing(text)}
          />
        </View>

        <View className="gap-1 flex-1">
          <ThemedText className="font-bold">Number of servings</ThemedText>

          <ThemedTextInput
            placeholder="Number of servings"
            keyboardType="number-pad"
            value={numberOfServings}
            onChangeText={(text) => setNumberOfServings(text)}
          />
        </View>
      </View>

      <Pressable className="bg-primary p-4 rounded-full" onPress={logCalories}>
        <ThemedText
          color="text-primary-foreground"
          className="text-center text-lg font-bold"
        >
          Log Calories
        </ThemedText>
      </Pressable>
    </View>
  );
}
