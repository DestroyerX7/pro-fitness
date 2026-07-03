import { WorkoutLogIcon } from "@/lib/types/workout-log-icon";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  nutritionLogs: many(nutritionLog),
  workoutLogs: many(workoutLog),
  nutritionLogPresets: many(nutritionLogPreset),
  workoutLogPresets: many(workoutLogPreset),
  goals: many(goal),
  dailyTarget: one(dailyTarget),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const nutritionLog = pgTable(
  "nutrition_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    calories: integer("calories").notNull(),
    consumedAt: timestamp("consumed_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    imageUrl: text("image_url"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("nutrition_log_userId_idx").on(table.userId)],
);

export const workoutLog = pgTable(
  "workout_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    minutes: integer("minutes").notNull(),
    performedAt: timestamp("performed_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    icon: jsonb("icon")
      .$type<WorkoutLogIcon>()
      .default({
        library: "MaterialCommunityIcons",
        name: "run",
      })
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("workout_log_userId_idx").on(table.userId)],
);

export const nutritionLogRelations = relations(nutritionLog, ({ one }) => ({
  user: one(user, {
    fields: [nutritionLog.userId],
    references: [user.id],
  }),
}));

export const workoutLogRelations = relations(workoutLog, ({ one }) => ({
  user: one(user, {
    fields: [workoutLog.userId],
    references: [user.id],
  }),
}));

export const nutritionLogPreset = pgTable(
  "nutrition_log_preset",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    calories: integer("calories").notNull(),
    imageUrl: text("image_url"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("nutrition_log_preset_userId_idx").on(table.userId)],
);

export const workoutLogPreset = pgTable(
  "workout_log_preset",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    minutes: integer("minutes").notNull(),
    icon: jsonb("icon")
      .$type<WorkoutLogIcon>()
      .default({
        library: "MaterialCommunityIcons",
        name: "run",
      })
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("workout_log_preset_userId_idx").on(table.userId)],
);

export const nutritionLogPresetRelations = relations(
  nutritionLogPreset,
  ({ one }) => ({
    user: one(user, {
      fields: [nutritionLogPreset.userId],
      references: [user.id],
    }),
  }),
);

export const workoutLogPresetRelations = relations(
  workoutLogPreset,
  ({ one }) => ({
    user: one(user, {
      fields: [workoutLogPreset.userId],
      references: [user.id],
    }),
  }),
);

export const goal = pgTable(
  "goal",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    completed: boolean("completed").default(false).notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("goal_userId_idx").on(table.userId)],
);

export const goalRelations = relations(goal, ({ one }) => ({
  user: one(user, {
    fields: [goal.userId],
    references: [user.id],
  }),
}));

export const dailyTarget = pgTable("daily_target", {
  id: uuid("id").defaultRandom().primaryKey(),
  calorieTarget: integer("calorie_target").default(2000).notNull(),
  workoutMinutesTarget: integer("workout_minutes_target").default(30).notNull(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const dailyTargetRelations = relations(dailyTarget, ({ one }) => ({
  user: one(user, {
    fields: [dailyTarget.userId],
    references: [user.id],
  }),
}));
