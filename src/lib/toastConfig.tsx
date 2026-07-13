import ThemedText from "@/components/ThemedText";
import { Pressable, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="bg-card flex-row gap-2 p-4 rounded-xl w-11/12"
    >
      <ThemedText className="text-card-foreground text-2xl">✅</ThemedText>

      <View className="flex-1">
        <ThemedText className="text-card-foreground font-semibold line-clamp-3">
          {text1}
        </ThemedText>

        <ThemedText className="text-xs text-muted-foreground line-clamp-3">
          {text2}
        </ThemedText>
      </View>
    </Pressable>
  ),
  error: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="bg-card flex-row gap-2 p-4 rounded-xl w-11/12"
    >
      <ThemedText className="text-card-foreground text-2xl">❗</ThemedText>

      <View className="flex-1">
        <ThemedText className="text-card-foreground font-semibold line-clamp-3">
          {text1}
        </ThemedText>

        <ThemedText className="text-xs text-muted-foreground line-clamp-3">
          {text2}
        </ThemedText>
      </View>
    </Pressable>
  ),
  loggedCalories: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="bg-card flex-row gap-2 p-4 rounded-xl w-11/12"
    >
      <ThemedText className="text-card-foreground text-2xl">🍽️</ThemedText>

      <View className="flex-1">
        <ThemedText className="text-card-foreground font-semibold line-clamp-3">
          {text1}
        </ThemedText>

        <ThemedText className="text-xs text-muted-foreground line-clamp-3">
          {text2}
        </ThemedText>
      </View>
    </Pressable>
  ),
  loggedWorkout: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="bg-card flex-row gap-2 p-4 rounded-xl w-11/12"
    >
      <ThemedText className="text-card-foreground text-2xl">💪</ThemedText>

      <View className="flex-1">
        <ThemedText className="text-card-foreground font-semibold line-clamp-3">
          {text1}
        </ThemedText>

        <ThemedText className="text-xs text-muted-foreground line-clamp-3">
          {text2}
        </ThemedText>
      </View>
    </Pressable>
  ),
  createdGoal: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      className="bg-card flex-row gap-2 p-4 rounded-xl w-11/12"
    >
      <ThemedText className="text-card-foreground text-2xl">🎯</ThemedText>

      <View className="flex-1">
        <ThemedText className="text-card-foreground font-semibold line-clamp-3">
          {text1}
        </ThemedText>

        <ThemedText className="text-xs text-muted-foreground line-clamp-3">
          {text2}
        </ThemedText>
      </View>
    </Pressable>
  ),
};
