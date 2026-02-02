import { db } from "@/db";
import { goal } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { goalId }: Record<string, string>,
) {
  const { hidden } = await request.json();

  const [updatedGoal] = await db
    .update(goal)
    .set({ hidden })
    .where(eq(goal.id, goalId))
    .returning();

  return Response.json({ goal: updatedGoal });
}
