import { getUser } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });
}
