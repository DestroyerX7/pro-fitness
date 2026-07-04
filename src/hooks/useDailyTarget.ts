import { queryKeys } from "@/constants/query-keys";
import { getDailyTarget } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useDailyTarget(userId: string) {
  return useQuery({
    queryKey: queryKeys.dailyTarget.byUser(userId),
    queryFn: getDailyTarget,
  });
}
