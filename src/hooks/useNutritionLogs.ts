import { queryKeys } from "@/constants/query-keys";
import { getNutritionLogs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useNutritionLogs(userId: string) {
  return useQuery({
    queryKey: queryKeys.nutritionLogs.all(userId),
    queryFn: getNutritionLogs,
  });
}
