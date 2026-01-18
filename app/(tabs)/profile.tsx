import { useAuth } from "@/components/AuthProvider";
import { authClient } from "@/lib/auth-client";
import { baseUrl } from "@/lib/backend";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from ".";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  const { data } = useAuth();

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

        <Text className="text-secondaryForeground">{user.email}</Text>
      </View>

      <View className="gap-4">
        <Text className="text-2xl font-bold text-foreground">
          Account Settings
        </Text>

        <View>
          <Text>Name</Text>
          <Text>{user.name}</Text>
        </View>

        <View>
          <Text>Email</Text>
          <Text>{user.email}</Text>
        </View>

        <View>
          <Text>Daily Calorie Goal</Text>
          <Text>{user.dailyCalorieGoal} calories</Text>
        </View>

        <View>
          <Text>Daily Workout Goal</Text>
          <Text>{user.dailyWorkoutGoal} minutes</Text>
        </View>

        <View>
          <Text>Account Created</Text>
          <Text>
            {new Date(user.createdAt.toString()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Pressable
        className="bg-foreground p-4 rounded-lg"
        onPress={async () => await authClient.signOut()}
      >
        <Text className="text-primaryForeground">Log out</Text>
      </Pressable>

      <Pressable
        className="bg-primaryForeground border border-border p-4 rounded-lg"
        onPress={showConfirmDeleteUser}
      >
        <Text>Delete Account</Text>
      </Pressable>
    </SafeAreaView>
  );
}
