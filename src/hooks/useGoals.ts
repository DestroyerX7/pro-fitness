import { getGoals } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useGoals(userId: string) {
  return useQuery({
    queryKey: ["goals", userId],
    queryFn: getGoals,
  });
}
