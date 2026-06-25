import ThemedText from "@/components/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

// const updateGoalMutation = useMutation({
//   mutationFn: updateGoal,
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
//   },
// });

// const deleteGoalMutation = useMutation({
//   mutationFn: deleteGoal,
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ["goals", authUser.id] });
//   },
// });

export default function Screen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  return (
    <View className="flex-1">
      <ThemedText>{goalId}</ThemedText>
    </View>
  );
}
