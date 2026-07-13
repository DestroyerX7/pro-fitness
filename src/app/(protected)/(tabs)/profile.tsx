import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import { useThemePreference } from "@/components/ThemeProvider";
import useDailyTarget from "@/hooks/useDailyTarget";
import { useImagePicker } from "@/hooks/useImagePicker";
import useTheme from "@/hooks/useTheme";
import { uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Profile() {
  const { user } = useAuthenticatedAuth();
  const { data: dailyTarget, refetch: refetchDailyTarget } = useDailyTarget(
    user.id,
  );

  const { preference, setPreference } = useThemePreference();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { pickImage } = useImagePicker(async (uri) => {
    try {
      const imageUrl = await uploadToCloudinary(uri);

      const { error } = await authClient.updateUser({
        image: imageUrl,
      });

      if (error !== null) {
        Toast.show({
          type: "error",
          text1: "Couldn't update image",
          text2: error.message ?? "Please try again.",
          topOffset: insets.top + 16,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't update image",
        text2: error instanceof Error ? error.message : "Please try again.",
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  });

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
          <ThemedText className="text-xl">Account Created</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.createdAt.toLocaleDateString()}
          </ThemedText>
        </View>
      </Card>

      <Card className="gap-4">
        <ThemedText className="text-2xl font-bold">Daily Targets</ThemedText>

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Calories</ThemedText>

          {dailyTarget !== undefined ? (
            <ThemedText className="text-muted-foreground text-xl">
              {dailyTarget.calorieTarget} calories
            </ThemedText>
          ) : (
            <View className="h-8 w-32 bg-border rounded-lg" />
          )}
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Workout Time</ThemedText>

          {dailyTarget !== undefined ? (
            <ThemedText className="text-muted-foreground text-xl">
              {dailyTarget.workoutMinutesTarget} minutes
            </ThemedText>
          ) : (
            <View className="h-8 w-32 bg-border rounded-lg" />
          )}
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
        className="bg-foreground p-4 rounded-xl flex-row gap-1 items-center border active:opacity-80"
        onPress={async () => await authClient.signOut()}
      >
        <MaterialCommunityIcons
          name="logout"
          size={16}
          color={theme.background}
        />

        <ThemedText className="text-background">Log out</ThemedText>
      </Pressable>
    </ScrollView>
  );
}
