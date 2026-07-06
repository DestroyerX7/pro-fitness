import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import { useThemePreference } from "@/components/ThemeProvider";
import useDailyTarget from "@/hooks/useDailyTarget";
import useTheme from "@/hooks/useTheme";
import { uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function Profile() {
  const { user } = useAuthenticatedAuth();
  const { data: dailyTarget, refetch: refetchDailyTarget } = useDailyTarget(
    user.id,
  );

  const { preference, setPreference } = useThemePreference();
  const theme = useTheme();

  const [isRefreshing, setIsRefreshing] = useState(false);

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

    const imageUrl = await uploadToCloudinary(result.assets[0].uri);
    authClient.updateUser({ image: imageUrl });
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

    const imageUrl = await uploadToCloudinary(result.assets[0].uri);
    authClient.updateUser({ image: imageUrl });
  };

  const handleRefresh = async () => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);

    try {
      await refetchDailyTarget();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <Pressable
        onPress={() => router.push("/(protected)/edit/profile")}
        className="flex-row gap-4 items-center"
      >
        <Pressable onPress={pickImage}>
          {user.image !== null ? (
            <Image
              source={{ uri: user.image }}
              style={{ width: 64, aspectRatio: 1, borderRadius: 32 }}
            />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={64}
              color={theme.foreground}
            />
          )}
        </Pressable>

        <View>
          <ThemedText className="text-4xl font-bold">{user.name}</ThemedText>

          <ThemedText className="text-muted-foreground">
            {user.email}
          </ThemedText>
        </View>
      </Pressable>

      <Card className="gap-4">
        <ThemedText className="text-2xl font-bold">Profile Info</ThemedText>

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Name</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.name}
          </ThemedText>
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Email</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.email}
          </ThemedText>
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Calorie Goal</ThemedText>

          {dailyTarget !== undefined ? (
            <ThemedText className="text-muted-foreground text-xl">
              {dailyTarget.calorieTarget} calories
            </ThemedText>
          ) : (
            <View className="h-8 w-32 bg-muted rounded-lg" />
          )}
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Workout Goal</ThemedText>

          {dailyTarget !== undefined ? (
            <ThemedText className="text-muted-foreground text-xl">
              {dailyTarget.workoutMinutesTarget} minutes
            </ThemedText>
          ) : (
            <View className="h-8 w-32 bg-muted rounded-lg" />
          )}
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Account Created</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {new Date(user.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
      </Card>

      <Card className="gap-4">
        <ThemedText className="text-2xl font-bold">Appearence</ThemedText>

        {(["system", "light", "dark"] as const).map((option) => (
          <Pressable
            key={option}
            onPress={() => setPreference(option)}
            className="p-4 border border-border rounded-xl flex-row items-center justify-between"
          >
            <ThemedText className="text-xl capitalize">{option}</ThemedText>

            <View
              className={cn(
                "w-8 h-8 border-2 rounded-full items-center justify-center",
                preference === option
                  ? "bg-primary border-primary"
                  : "bg-transparent border-border",
              )}
            >
              {preference === option && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={theme.primaryForeground}
                />
              )}
            </View>
          </Pressable>
        ))}
      </Card>

      <Pressable
        className="bg-foreground p-4 rounded-xl flex-row gap-2 items-center border active:opacity-80"
        onPress={async () => await authClient.signOut()}
      >
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color={theme.background}
        />

        <ThemedText className="text-background">Log out</ThemedText>
      </Pressable>
    </ScrollView>
  );
}
