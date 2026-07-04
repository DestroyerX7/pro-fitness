import { queryKeys } from "@/constants/query-keys";
import { getGoals } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useGoals(userId: string) {
  return useQuery({
    queryKey: queryKeys.goals.all(userId),
    queryFn: getGoals,
  });
}
