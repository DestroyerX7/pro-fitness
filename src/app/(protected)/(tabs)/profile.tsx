import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import { useThemePreference } from "@/components/ThemeProvider";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import { updateUser, uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthenticatedAuth();
  const { data: user, isPending, error } = useUser(authUser.id);

  const { preference, setPreference } = useThemePreference();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authUser.id] });
    },
  });

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
    updateUserMutation.mutate({ image: imageUrl, userId: authUser.id });
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
    updateUserMutation.mutate({ image: imageUrl, userId: authUser.id });
  };

  if (error !== null) {
    return <ThemedText>{error.message}</ThemedText>;
  }

  if (isPending) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <ScrollView
      contentContainerClassName="gap-4"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => router.push("/(protected)/edit/user")}
        className="flex-row gap-4 items-center"
      >
        {user.image !== null ? (
          <Pressable onPress={pickImage}>
            <Image
              source={{ uri: user.image }}
              style={{ width: 64, aspectRatio: 1, borderRadius: 32 }}
            />
          </Pressable>
        ) : (
          <MaterialCommunityIcons
            name="account-circle"
            size={64}
            color={theme.foreground}
          />
        )}

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

          <ThemedText className="text-muted-foreground text-xl">
            {user.dailyCalorieGoal} calories
          </ThemedText>
        </View>

        <View className="h-px bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Workout Goal</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.dailyWorkoutGoal} minutes
          </ThemedText>
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
