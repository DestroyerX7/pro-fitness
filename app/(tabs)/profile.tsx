import { useAuth } from "@/components/AuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import { getUser } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { baseUrl } from "@/lib/backend";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useColorScheme } from "nativewind";
import React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { data: authData } = useAuth();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ["user", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getUser(userId);
    },
    enabled: authData !== null,
  });

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
    await axios.delete(`${baseUrl}/api/delete-user/${authData?.user.id}`);
    await authClient.signOut();
  };

  if (error !== null) {
    return <ThemedText>Error</ThemedText>;
  }

  if (isPending) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <SafeAreaView edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ gap: 16, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ThemedText className="text-4xl font-bold">{user.name}</ThemedText>

          <ThemedText color="text-muted-foreground">{user.email}</ThemedText>
        </View>

        <Card className="gap-4">
          <ThemedText className="text-2xl font-bold">Profile Info</ThemedText>

          <View className="flex-row justify-between">
            <ThemedText className="text-xl">Name</ThemedText>
            <ThemedText color="text-muted-foreground" className="text-xl">
              {user.name}
            </ThemedText>
          </View>

          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between">
            <ThemedText className="text-xl">Email</ThemedText>
            <ThemedText color="text-muted-foreground" className="text-xl">
              {user.email}
            </ThemedText>
          </View>

          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between">
            <ThemedText className="text-xl">Daily Calorie Goal</ThemedText>
            <ThemedText color="text-muted-foreground" className="text-xl">
              {user.dailyCalorieGoal} calories
            </ThemedText>
          </View>

          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between">
            <ThemedText className="text-xl">Daily Workout Goal</ThemedText>
            <ThemedText color="text-muted-foreground" className="text-xl">
              {user.dailyWorkoutGoal} minutes
            </ThemedText>
          </View>

          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between">
            <ThemedText className="text-xl">Account Created</ThemedText>
            <ThemedText color="text-muted-foreground" className="text-xl">
              {new Date(user.createdAt.toString()).toLocaleDateString()}
            </ThemedText>
          </View>
        </Card>

        <Card className="gap-4">
          <ThemedText className="text-2xl font-bold">Appearence</ThemedText>

          <Pressable className="p-4 border border-border rounded-xl flex-row items-center justify-between">
            <ThemedText className="text-xl">System</ThemedText>

            {true && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.primary}
              />
            )}
          </Pressable>

          <Pressable className="p-4 border border-border rounded-xl flex-row items-center justify-between">
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
          </Pressable>
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

          <ThemedText color="text-background">Log out</ThemedText>
        </Pressable>

        <Pressable
          className="bg-destructive-accent p-4 rounded-xl flex-row gap-2 items-center border border-destructive"
          onPress={showConfirmDeleteUser}
        >
          <MaterialCommunityIcons
            name="trash-can"
            size={24}
            color={theme.destructive}
          />
          <ThemedText>Delete Account</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
