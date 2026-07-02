import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const updateUserSchema = createUpdateSchema(user, {
  dailyCalorieGoal: (schema) => schema.int().min(1),
  dailyWorkoutGoal: (schema) => schema.int().min(1),
  image: z.url().nullable().optional(),
}).pick({ dailyCalorieGoal: true, dailyWorkoutGoal: true, image: true });

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

export async function PATCH(
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

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return Response.json(
      { error: "No fields provided to update" },
      { status: 400 },
    );
  }

  const [updatedUser] = await db
    .update(user)
    .set(parsed.data)
    .where(eq(user.id, userId))
    .returning();

  if (updatedUser === undefined) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(updatedUser);
}

export async function DELETE(
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

  const [deletedUser] = await db
    .delete(user)
    .where(eq(user.id, userId))
    .returning();

  if (deletedUser === undefined) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(deletedUser);
}
