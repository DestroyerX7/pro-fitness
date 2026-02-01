import { useAuth } from "@/components/AuthProvider";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import { getGoals } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Goals() {
  const { data } = useAuth();

  const { colorScheme } = useColorScheme();

  const {
    data: goals,
    isPending,
    error,
  } = useQuery({
    queryKey: ["goals", data?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getGoals(userId);
    },
    enabled: data !== null,
  });

  if (error !== null) {
    return <ThemedText>Error</ThemedText>;
  }

  if (isPending) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <SafeAreaView className="p-4 gap-4">
      <ThemedText className="text-4xl font-bold">Goals</ThemedText>

      {goals.map((goal) => (
        <GoalItem
          id={goal.id}
          key={goal.id}
          name={goal.name}
          description={goal.description}
          completed={goal.completed}
          colorScheme={colorScheme}
        />
      ))}
    </SafeAreaView>
  );
}
