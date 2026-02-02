import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
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
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000).notNull(),
  dailyWorkoutGoal: integer("daily_workout_goal").default(60).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
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
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  calorieLogs: many(calorieLog),
  workoutLogs: many(workoutLog),
  calorieLogPresets: many(calorieLogPreset),
  workoutLogPresets: many(workoutLogPreset),
  goals: many(goal),
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

export const calorieLog = pgTable(
  "calorie_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    calories: integer("calories").notNull(),
    date: date("date").defaultNow().notNull(),
    imageUrl: text("image_url"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("calorie_log_userId_idx").on(table.userId)],
);

export const iconLibraries = [
  "MaterialIcons",
  "MaterialCommunityIcons",
] as const;

export type IconLibrary = (typeof iconLibraries)[number];

export const iconLibraryEnum = pgEnum("icon_library_enum", iconLibraries);

export const workoutLog = pgTable(
  "workout_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    date: date("date").defaultNow().notNull(),
    iconLibrary: iconLibraryEnum("icon_library").notNull(),
    iconName: text("icon_name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("workout_log_userId_idx").on(table.userId)],
);

export const calorieLogRelations = relations(calorieLog, ({ one }) => ({
  user: one(user, {
    fields: [calorieLog.userId],
    references: [user.id],
  }),
}));

export const workoutLogRelations = relations(workoutLog, ({ one }) => ({
  user: one(user, {
    fields: [workoutLog.userId],
    references: [user.id],
  }),
}));

export const calorieLogPreset = pgTable(
  "calorie_log_preset",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    calories: integer("calories").notNull(),
    imageUrl: text("image_url"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("calorie_log_preset_userId_idx").on(table.userId)],
);

export const workoutLogPreset = pgTable(
  "workout_log_preset",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    iconLibrary: iconLibraryEnum("icon_library").notNull(),
    iconName: text("icon_name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("workout_log_preset_userId_idx").on(table.userId)],
);

export const calorieLogPresetRelations = relations(
  calorieLogPreset,
  ({ one }) => ({
    user: one(user, {
      fields: [calorieLogPreset.userId],
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
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
