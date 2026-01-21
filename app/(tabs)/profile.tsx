import { useAuth } from "@/components/AuthProvider";
import { authClient } from "@/lib/auth-client";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
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
        <Text className="text-4xl font-bold text-foreground">
          Welcome {user.name}
        </Text>

        <Text className="text-muted-foreground">{user.email}</Text>
      </View>

      <View className="gap-4 bg-background p-8 rounded-[32px]">
        <View className="flex-row justify-between">
          <Text className="text-xl text-foreground">Name</Text>
          <Text className="text-xl text-secondaryForeground">{user.name}</Text>
        </View>

        <View className="h-[1px] bg-secondary" />

        <View className="flex-row justify-between">
          <Text className="text-xl text-foreground">Email</Text>
          <Text className="text-xl text-secondaryForeground">{user.email}</Text>
        </View>

        <View className="h-[1px] bg-secondary" />

        <View className="flex-row justify-between">
          <Text className="text-xl text-foreground">Daily Calorie Goal</Text>
          <Text className="text-xl text-secondaryForeground">
            {user.dailyCalorieGoal} calories
          </Text>
        </View>

        <View className="h-[1px] bg-secondary" />

        <View className="flex-row justify-between">
          <Text className="text-xl text-foreground">Daily Workout Goal</Text>
          <Text className="text-xl text-secondaryForeground">
            {user.dailyWorkoutGoal} minutes
          </Text>
        </View>

        <View className="h-[1px] bg-secondary" />

        <View className="flex-row justify-between">
          <Text className="text-xl text-foreground">Account Created</Text>
          <Text className="text-xl text-secondaryForeground">
            {new Date(user.createdAt.toString()).toLocaleDateString()}
          </Text>
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
        <Text className="text-background">Log out</Text>
      </Pressable>

      <Pressable
        className="bg-destructive-foreground //border border-[#ffdddd] p-4 rounded-full flex-row gap-2 items-center"
        onPress={showConfirmDeleteUser}
      >
        <MaterialCommunityIcons
          name="trash-can"
          size={24}
          color={theme.destructive}
        />
        <Text className="text-destructive">Delete Account</Text>
      </Pressable>
    </SafeAreaView>
  );
}
