import { db } from "@/db";
import { goal } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(_: Request, { userId }: Record<string, string>) {
  const goals = await db
    .select()
    .from(goal)
    .where(eq(goal.userId, userId))
    .orderBy(desc(goal.createdAt));

  return Response.json({ goals });
}
