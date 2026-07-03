import { getDailyTarget } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useDailyTarget(userId: string) {
  return useQuery({
    queryKey: ["dailyTarget", userId],
    queryFn: getDailyTarget,
  });
}
