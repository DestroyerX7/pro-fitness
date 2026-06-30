import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import { deleteUser, updateUser, uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthenticatedAuth();
  const { data: user, isPending, error } = useUser(authUser.id);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", authUser.id] });
    },
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
            await deleteUser(authUser.id);
            await authClient.signOut();
          },
          style: "destructive",
        },
      ],
    );
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
      <View className="flex-row gap-4 items-center">
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
      </View>

      <Card className="gap-4">
        <ThemedText className="text-2xl font-bold">Profile Info</ThemedText>

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Name</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.name}
          </ThemedText>
        </View>

        <View className="h-[1px] bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Email</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.email}
          </ThemedText>
        </View>

        <View className="h-[1px] bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Calorie Goal</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.dailyCalorieGoal} calories
          </ThemedText>
        </View>

        <View className="h-[1px] bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Workout Goal</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {user.dailyWorkoutGoal} minutes
          </ThemedText>
        </View>

        <View className="h-[1px] bg-border" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Account Created</ThemedText>

          <ThemedText className="text-muted-foreground text-xl">
            {new Date(user.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
      </Card>

      <Card className="gap-4">
        <ThemedText className="text-2xl font-bold">Appearence</ThemedText>

        <Pressable className="p-4 border border-border rounded-xl flex-row items-center justify-between">
          <ThemedText className="text-xl">System</ThemedText>

          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={theme.primary}
          />
        </Pressable>

        {/* <Pressable className="p-4 border border-border rounded-xl flex-row items-center justify-between">
            <ThemedText className="text-xl">Light</ThemedText>

            {false && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.primary}
              />
            )}
          </Pressable>

          <Pressable className="p-4 border border-border rounded-xl flex-row items-center justify-between">
            <ThemedText className="text-xl">Dark</ThemedText>

            {false && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.primary}
              />
            )}
          </Pressable> */}
      </Card>

      <Pressable
        className="bg-foreground p-4 rounded-xl flex-row gap-2 items-center border"
        onPress={async () => await authClient.signOut()}
      >
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color={theme.background}
        />

        <ThemedText className="text-background">Log out</ThemedText>
      </Pressable>

      <Pressable
        className="bg-destructive-accent p-4 rounded-xl flex-row gap-2 items-center border border-destructive"
        onPress={handleDeleteUser}
      >
        <MaterialCommunityIcons
          name="trash-can"
          size={24}
          color={theme.destructive}
        />
        <ThemedText>Delete Account</ThemedText>
      </Pressable>
    </ScrollView>
  );
}
