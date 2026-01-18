import { db } from "@/db/index";
import { calorieLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { userId }: Record<string, string>) {
  const calorieLogs = await db
    .select()
    .from(calorieLog)
    .where(eq(calorieLog.userId, userId));

  return Response.json({ calorieLogs });
}
