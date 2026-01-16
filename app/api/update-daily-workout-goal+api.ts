import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  const { userId, dailyWorkoutGoal } = await request.json();

  const [updatedUser] = await db
    .update(user)
    .set({ dailyWorkoutGoal })
    .where(eq(user.id, userId))
    .returning();

  return Response.json({ user: updatedUser });
}
