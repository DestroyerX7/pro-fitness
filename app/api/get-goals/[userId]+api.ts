import { db } from "@/db";
import { goal } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { userId }: Record<string, string>) {
  const goals = await db.select().from(goal).where(eq(goal.userId, userId));

  return Response.json({ goals });
}
