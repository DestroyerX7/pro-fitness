import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import { deleteUser, updateUser, uploadToCloudinary } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";

export default function EditUser() {
  const { user: authUser } = useAuthenticatedAuth();
  const { data: user } = useUser(authUser.id);

  const queryClient = useQueryClient();
  const theme = useTheme();

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

  if (user === undefined) {
    return;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: user.email,
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2">
          <Pressable onPress={pickImage}>
            {user.image !== null ? (
              <Image
                source={{ uri: user.image }}
                style={{ width: 128, aspectRatio: 1, borderRadius: 64 }}
              />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                size={128}
                color={theme.foreground}
              />
            )}
          </Pressable>

          <View className="items-center">
            <ThemedText className="text-sm font-medium">
              Change profile image
            </ThemedText>

            <ThemedText className="text-xs text-muted-foreground">
              Tap to select an image
            </ThemedText>
          </View>
        </View>

        <View className="gap-2">
          <ThemedText className="font-medium text-sm">Name</ThemedText>

          <ThemedTextInput value={user.name} />
        </View>

        <View className="gap-2">
          <ThemedText className="font-medium text-sm">
            Daily Calorie Goal
          </ThemedText>

          <ThemedTextInput value={user.dailyCalorieGoal.toString()} />
        </View>

        <View className="gap-2">
          <ThemedText className="font-medium text-sm">
            Daily Workout Goal
          </ThemedText>

          <ThemedTextInput value={user.dailyWorkoutGoal.toString()} />
        </View>

        <View className="gap-4">
          {/* Save */}
          <Pressable
            //   onPress={handleSubmit(onSubmit)}
            className={cn(
              "h-12 items-center justify-center rounded-xl bg-primary active:opacity-80",
              false ? "opacity-50" : "",
            )}
            disabled={false}
          >
            <ThemedText className="font-semibold text-primary-foreground">
              {false ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>

          <Pressable
            className="h-12 items-center justify-center bg-foreground rounded-xl flex-row gap-2 border active:opacity-80"
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
            className="h-12 items-center justify-center bg-muted rounded-xl flex-row gap-2 active:opacity-80"
            onPress={handleDeleteUser}
          >
            <MaterialCommunityIcons
              name="trash-can"
              size={24}
              color={theme.destructive}
            />

            <ThemedText className="text-destructive">Delete Account</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
