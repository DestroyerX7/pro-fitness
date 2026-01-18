import { db } from "@/db/index";
import { calorieLogPreset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { userId }: Record<string, string>) {
  const calorieLogPresets = await db
    .select()
    .from(calorieLogPreset)
    .where(eq(calorieLogPreset.userId, userId));

  return Response.json({ calorieLogPresets });
}
