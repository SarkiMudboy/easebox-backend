import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", [
  "individual",
  "logistics_company",
  "rider",
]);

export const otpTypeEnum = pgEnum("otp_type", ["email", "phone"]);

export const users = pgTable("users", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  id: uuid("id").primaryKey().defaultRandom(),
  isActive: boolean("is_active").notNull().default(true),
  password: text("password").notNull(),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userType: userTypeEnum("user_type").notNull().default("individual"),
});

// Individual Profile - 1:1 with User
export const individualProfiles = pgTable("individual_profiles", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  firstName: text("first_name").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});

// Rider Profile - 1:1 with User
export const riderProfiles = pgTable("rider_profiles", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  firstName: text("first_name").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});

// OTP table for verification
export const otps = pgTable("otps", {
  code: text("code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  type: otpTypeEnum("type").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  individualProfile: one(individualProfiles, {
    fields: [users.id],
    references: [individualProfiles.userId],
  }),
  otps: many(otps),
  riderProfile: one(riderProfiles, {
    fields: [users.id],
    references: [riderProfiles.userId],
  }),
}));

export const individualProfilesRelations = relations(
  individualProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [individualProfiles.userId],
      references: [users.id],
    }),
  })
);

export const riderProfilesRelations = relations(riderProfiles, ({ one }) => ({
  user: one(users, {
    fields: [riderProfiles.userId],
    references: [users.id],
  }),
}));

export const otpsRelations = relations(otps, ({ one }) => ({
  user: one(users, {
    fields: [otps.userId],
    references: [users.id],
  }),
}));

// Types
export type IndividualProfile = typeof individualProfiles.$inferSelect;
export type NewIndividualProfile = typeof individualProfiles.$inferInsert;
export type NewOtp = typeof otps.$inferInsert;
export type NewRiderProfile = typeof riderProfiles.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type OtpType = "email" | "phone";
export type RiderProfile = typeof riderProfiles.$inferSelect;
export type User = typeof users.$inferSelect;
