import { getWorkoutLogs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useWorkoutLogs(userId: string) {
  return useQuery({
    queryKey: ["workoutLogs", userId],
    queryFn: () => getWorkoutLogs(userId),
  });
}
