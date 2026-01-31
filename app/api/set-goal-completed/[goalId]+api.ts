import { db } from "@/db";
import { goal } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { goalId }: Record<string, string>,
) {
  const { completed } = await request.json();

  const [updatedGoal] = await db
    .update(goal)
    .set({ completed })
    .where(eq(goal.id, goalId))
    .returning();

  return Response.json({ goal: updatedGoal });
}
