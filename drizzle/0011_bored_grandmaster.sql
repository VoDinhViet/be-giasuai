CREATE TYPE "public"."class_admission_mode" AS ENUM('INVITE_ONLY', 'REQUEST_APPROVAL', 'OPEN');--> statement-breakpoint
CREATE TYPE "public"."class_learning_mode" AS ENUM('OFFLINE', 'ONLINE', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."class_weekday" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "meeting_url" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "start_time" time;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "end_time" time;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "repeat_days" "class_weekday"[] DEFAULT ARRAY[]::class_weekday[] NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "learning_mode" "class_learning_mode" DEFAULT 'OFFLINE' NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "admission_mode" "class_admission_mode" DEFAULT 'REQUEST_APPROVAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "allow_waitlist" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "send_reminder" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "auto_create_sessions" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "schedule";