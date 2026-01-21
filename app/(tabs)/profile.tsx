import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import { authClient } from "@/lib/auth-client";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from ".";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  const { data } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  useEffect(() => {
    const getUser = async () => {
      const response: { data: { user: User } } = await axios.get(
        `${baseUrl}/api/get-user/${data?.user.id}`,
      );

      setUser(response.data.user);
    };

    getUser();
  }, []);

  const showConfirmDeleteUser = () => {
    Alert.alert(
      `Delete account`,
      "Are you sure you want to permanently delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteUser(),
          style: "destructive",
        },
      ],
    );
  };

  const deleteUser = async () => {
    await axios.delete(`${baseUrl}/api/delete-user/${data?.user.id}`);
    await authClient.signOut();
  };

  if (user === null) {
    return;
  }

  return (
    <SafeAreaView className="p-4 gap-4">
      <View>
        <ThemedText className="text-4xl font-bold">
          Welcome {user.name}
        </ThemedText>

        <ThemedText variant="muted-foreground">{user.email}</ThemedText>
      </View>

      <View className="gap-4 bg-card-background p-8 rounded-[32px] border border-border">
        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Name</ThemedText>
          <ThemedText variant="secondary-foreground" className="text-xl">
            {user.name}
          </ThemedText>
        </View>

        <View className="h-[1px] bg-muted-foreground" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Email</ThemedText>
          <ThemedText variant="secondary-foreground" className="text-xl">
            {user.email}
          </ThemedText>
        </View>

        <View className="h-[1px] bg-muted-foreground" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Calorie Goal</ThemedText>
          <ThemedText variant="secondary-foreground" className="text-xl">
            {user.dailyCalorieGoal} calories
          </ThemedText>
        </View>

        <View className="h-[1px] bg-muted-foreground" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Daily Workout Goal</ThemedText>
          <ThemedText variant="secondary-foreground" className="text-xl">
            {user.dailyWorkoutGoal} minutes
          </ThemedText>
        </View>

        <View className="h-[1px] bg-muted-foreground" />

        <View className="flex-row justify-between">
          <ThemedText className="text-xl">Account Created</ThemedText>
          <ThemedText variant="secondary-foreground" className="text-xl">
            {new Date(user.createdAt.toString()).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>

      <Pressable
        className="bg-foreground p-4 rounded-full flex-row gap-2 items-center"
        onPress={async () => await authClient.signOut()}
      >
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color={theme.background}
        />
        <ThemedText variant="background">Log out</ThemedText>
      </Pressable>

      <Pressable
        className="bg-muted //border border-[#ffdddd] p-4 rounded-full flex-row gap-2 items-center"
        onPress={showConfirmDeleteUser}
      >
        <MaterialCommunityIcons
          name="trash-can"
          size={24}
          color={theme.destructive}
        />
        <ThemedText variant="foreground">Delete Account</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}
