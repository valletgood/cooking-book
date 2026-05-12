import {
  pgTable,
  bigserial,
  varchar,
  text,
  smallint,
  integer,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

// ============================================
// Auth 도메인 (NextAuth.js Drizzle Adapter 표준)
// ============================================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ============================================
// Recipe 도메인
// ============================================

export const recipes = pgTable("recipes", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 20 }),
  sourceType: varchar("source_type", { length: 10 }).notNull(),
  sourceUrl: text("source_url"),
  imageUrl: text("image_url"),
  servings: smallint("servings"),
  prepTime: varchar("prep_time", { length: 50 }),
  cookTime: varchar("cook_time", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  amount: varchar("amount", { length: 50 }),
  unit: varchar("unit", { length: 30 }),
  orderIndex: smallint("order_index").default(0).notNull(),
});

export const recipeSteps = pgTable("recipe_steps", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  stepNumber: smallint("step_number").notNull(),
  instruction: text("instruction").notNull(),
  tip: text("tip"),
});

export const recipeNutrition = pgTable("recipe_nutrition", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" })
    .unique(),
  calories: smallint("calories"),
  carbohydrates: smallint("carbohydrates"),
  protein: smallint("protein"),
  fat: smallint("fat"),
  sodium: smallint("sodium"),
  isEstimated: boolean("is_estimated").default(true).notNull(),
});

// ============================================
// Cooking 도메인
// ============================================

export const cookingProgress = pgTable("cooking_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" })
    .unique(),
  currentStep: smallint("current_step").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cookLogs = pgTable("cook_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  memo: text("memo"),
  cookedAt: timestamp("cooked_at", { withTimezone: true }).defaultNow().notNull(),
});
