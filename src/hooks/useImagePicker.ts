import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useImagePicker(onImageSelected: (uri: string) => void) {
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

    onImageSelected(result.assets[0].uri);
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

    onImageSelected(result.assets[0].uri);
  };

  const pickImage = () => {
    Alert.alert("Select Image", "Choose an option.", [
      { text: "Take Photo", onPress: openCamera },
      { text: "Choose from Library", onPress: openLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return { pickImage, openCamera, openLibrary };
}
