import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { userId }: Record<string, string>,
) {
  const { dailyCalorieGoal } = await request.json();

  const [updatedUser] = await db
    .update(user)
    .set({ dailyCalorieGoal })
    .where(eq(user.id, userId))
    .returning();

  return Response.json({ user: updatedUser });
}
