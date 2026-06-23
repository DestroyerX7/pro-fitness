import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import useTheme from "@/hooks/useTheme";
import useUser from "@/hooks/useUser";
import { backendUrl } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { user: authUser } = useAuthenticatedAuth();
  const { data: user, isPending, error } = useUser(authUser.id);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const showConfirmDeleteUser = () => {
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
          onPress: () => deleteUser(),
          style: "destructive",
        },
      ],
    );
  };

  const deleteUser = async () => {
    await axios.delete(`${backendUrl}/api/delete-user/${authUser.id}`);
    await authClient.signOut();
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
  );
}
