import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

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

  const [selectedUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));

  if (selectedUser === undefined) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(selectedUser);
}
