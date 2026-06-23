import { getCalorieLogs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useCalorieLogs(userId: string) {
  return useQuery({
    queryKey: ["calorieLogs", userId],
    queryFn: () => getCalorieLogs(userId),
  });
}
