import ThemedText from "@/components/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

// const updateWorkoutLogMutaion = useMutation({
//   mutationFn: updateWorkoutLog,
//   onSuccess: () => {
//     queryClient.invalidateQueries({
//       queryKey: ["workoutLogs", authUser.id],
//     });
//   },
// });

// const deleteWorkoutLogMutation = useMutation({
//   mutationFn: deleteWorkoutLog,
//   onSuccess: () => {
//     queryClient.invalidateQueries({
//       queryKey: ["workoutLogs", authUser.id],
//     });
//   },
// });

export default function Screen() {
  const { workoutLogId } = useLocalSearchParams<{ workoutLogId: string }>();

  return (
    <View className="flex-1">
      <ThemedText>{workoutLogId}</ThemedText>
    </View>
  );
}
