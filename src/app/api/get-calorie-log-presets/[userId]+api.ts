import { db } from "@/db/index";
import { calorieLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { userId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const calorieLogPresets = await db
    .select()
    .from(calorieLogPreset)
    .where(eq(calorieLogPreset.userId, userId))
    .orderBy(desc(calorieLogPreset.updatedAt));

  return Response.json(calorieLogPresets);
}
