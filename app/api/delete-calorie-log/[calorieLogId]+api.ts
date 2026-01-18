import { db } from "@/db";
import { calorieLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { calorieLogId }: Record<string, string>,
) {
  const [deletedCalorieLog] = await db
    .delete(calorieLog)
    .where(eq(calorieLog.id, calorieLogId))
    .returning();

  return Response.json({ calorieLog: deletedCalorieLog });
}
