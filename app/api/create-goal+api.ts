import { db } from "@/db";
import { goal } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, description } = await request.json();

  const [createdGoal] = await db
    .insert(goal)
    .values({ userId, name, description })
    .returning();

  return Response.json({ goal: createdGoal });
}
