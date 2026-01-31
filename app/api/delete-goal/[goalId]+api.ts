import { db } from "@/db";
import { goal } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_: Request, { goalId }: Record<string, string>) {
  const [deletedGoal] = await db
    .delete(goal)
    .where(eq(goal.id, goalId))
    .returning();

  return Response.json({ goal: deletedGoal });
}
