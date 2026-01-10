CREATE TYPE "public"."user_type" AS ENUM('individual', 'logistics_company', 'rider');--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_name" text NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_type" "user_type" DEFAULT 'individual' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
