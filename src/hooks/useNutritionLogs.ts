import { getNutritionLogs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useNutritionLogs(userId: string) {
  return useQuery({
    queryKey: ["nutritionLogs", userId],
    queryFn: getNutritionLogs,
  });
}
