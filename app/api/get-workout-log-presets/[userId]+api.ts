import { db } from "@/db/index";
import { workoutLogPreset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { userId }: Record<string, string>) {
  const workoutLogPresets = await db
    .select()
    .from(workoutLogPreset)
    .where(eq(workoutLogPreset.userId, userId));

  return Response.json({ workoutLogPresets });
}
