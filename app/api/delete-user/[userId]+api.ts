import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_: Request, { userId }: Record<string, string>) {
  const [deletedUser] = await db
    .delete(user)
    .where(eq(user.id, userId))
    .returning();

  return Response.json({ user: deletedUser });
}
