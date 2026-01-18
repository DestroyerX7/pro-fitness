import { db } from "@/db";
import { calorieLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { calorieLogId }: Record<string, string>,
) {
  const { name, calories, date, imageUrl } = await request.json();

  const [updatedCalorieLog] = await db
    .update(calorieLog)
    .set({ name, calories, date, imageUrl })
    .where(eq(calorieLog.id, calorieLogId))
    .returning();

  return Response.json({ calorieLog: updatedCalorieLog });
}
