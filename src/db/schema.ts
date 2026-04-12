import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  facilitator: text("facilitator"),
  context: text("context"),

  data: jsonb("data").$type<{
    tagsInternal: string[];
    tagsExternal: string[];
    demands: string[][];
    cadences: string[][];
    workflow: string[];
    classes: string[];
    steps: Record<string, string>;
  }>().default({
    tagsInternal: [],
    tagsExternal: [],
    demands: [],
    cadences: [],
    workflow: ["Backlog", "Em andamento", "Pausado", "Entregue"],
    classes: [],
    steps: {},
  }),

  aiCache: jsonb("ai_cache").$type<Record<number, string>>().default({}),
  diagnosis: jsonb("diagnosis").$type<{
    overview: string;
    patterns: string[];
    nextsteps: string[];
  }>(),

  isDone: boolean("is_done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
