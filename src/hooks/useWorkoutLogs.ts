import { queryKeys } from "@/constants/query-keys";
import { getWorkoutLogs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useWorkoutLogs(userId: string) {
  return useQuery({
    queryKey: queryKeys.workoutLogs.all(userId),
    queryFn: getWorkoutLogs,
  });
}
