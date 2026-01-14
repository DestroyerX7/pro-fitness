import { useAuth } from "@/components/AuthProvider";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BarcodeScanningResult, CameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

type GetProductByBarcodeResponse = {
  product: Product;
};

type Product = {
  code: string;
  product_name: string;
  serving_size: string;
  nutriments: {
    "energy-kcal_100g": number;
    "energy-kcal_serving": number;
  };
  image_url: string;
};

export default function Scan() {
  const [product, setProduct] = useState<Product | null>(null);
  const isLoading = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const [numberOfServings, setNumberOfServings] = useState("");

  const { data } = useAuth();

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (isLoading.current || product !== null) {
      return;
    }

    console.log("Barcode scanned");

    lookupBarcode(scanningResult.data);
  };

  const lookupBarcode = async (barcode: string) => {
    if (isLoading.current || product !== null) {
      return;
    }

    isLoading.current = true;
    console.log("Loading...");

    try {
      const response: { data: GetProductByBarcodeResponse } = await axios.get(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}`
      );

      console.log(response.data.product.product_name);

      setProduct(response.data.product);
    } catch (error) {
      setError("Product not found, try again.");
    } finally {
      // isLoading.current = false;
      console.log("Done loading");
    }
  };

  const logCalories = async () => {
    const numberOfServingsNum = Number(numberOfServings);

    if (product === null || data === null || numberOfServingsNum < 0) {
      return;
    }

    await axios.post(`${baseUrl}/api/log-calories`, {
      userId: data.user.id,
      name: product.product_name,
      calories: product.nutriments["energy-kcal_serving"] * numberOfServingsNum,
      imageUrl: product.image_url,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const rescan = () => {
    setProduct(null);
    setError(null);
    isLoading.current = false;
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
            color={colors.primaryForeground}
          />

          <Text className="text-primaryForeground text-center text-lg font-bold">
            Rescan
          </Text>
        </Pressable>

        <View className="flex-row gap-2 items-center justify-center">
          <MaterialIcons name="error" size={32} color={colors.foreground} />
          <Text className="text-2xl">{error}</Text>
        </View>
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

  if (product !== null) {
    return (
      <View className="p-4 gap-4">
        <Pressable
          className="bg-secondaryForeground p-4 rounded-full flex-row items-center justify-center gap-2"
          onPress={rescan}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={colors.primaryForeground}
          />

          <Text className="text-primaryForeground text-center text-lg font-bold">
            Rescan
          </Text>
        </Pressable>

        <Image
          className="h-64"
          style={{ objectFit: "contain" }}
          source={{
            uri: product.image_url,
          }}
        />

        <View className="gap-1">
          <Text className="font-bold">Name</Text>

          <TextInput
            className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
            placeholder="Name"
            value={product.product_name}
          />
        </View>

        <View className="gap-1">
          <Text className="font-bold">Date</Text>

          <TextInput
            className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
            placeholder="Date"
            value={new Date().toLocaleDateString()}
          />
        </View>

        <View className="gap-1">
          <Text className="font-bold">Calories per serving</Text>

          <TextInput
            className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
            placeholder="Calories per serving"
            value={product.nutriments["energy-kcal_serving"].toString()}
          />
        </View>

        <View className="gap-1">
          <Text className="font-bold">Number of servings</Text>

          <TextInput
            className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
            placeholder="Number of servings"
            value={numberOfServings}
            onChangeText={(text) => setNumberOfServings(text)}
          />
        </View>

        <Pressable
          className="bg-primary p-4 rounded-full"
          onPress={logCalories}
        >
          <Text className="text-primaryForeground text-center text-lg font-bold">
            Log Calories
          </Text>
        </Pressable>
      </View>
    );
  }

  return <Text>Hello</Text>;
}
