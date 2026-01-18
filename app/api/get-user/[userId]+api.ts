import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { userId }: Record<string, string>) {
  const [selectedUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));

  return Response.json({ user: selectedUser });
}
