import { db } from "@/db";
import { calorieLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { calorieLogId }: Record<string, string>,
) {
  const { name, calories, consumedAt, imageUrl } = await request.json();

  const [updatedCalorieLog] = await db
    .update(calorieLog)
    .set({ name, calories, consumedAt, imageUrl })
    .where(eq(calorieLog.id, calorieLogId))
    .returning();

  return Response.json(updatedCalorieLog);
}
