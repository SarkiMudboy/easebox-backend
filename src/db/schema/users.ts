import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", ["individual", "logistics_company", "rider"]);

export const users = pgTable("users", {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  isActive: boolean("is_active").notNull().default(true),
  lastName: text("last_name").notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  userType: userTypeEnum("user_type").notNull().default("individual"),
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

