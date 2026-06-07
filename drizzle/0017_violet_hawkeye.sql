ALTER TYPE "public"."class_learning_mode" RENAME TO "class_format";--> statement-breakpoint
ALTER TYPE "public"."class_admission_mode" RENAME TO "class_join_policy";--> statement-breakpoint
ALTER TABLE "classes" RENAME COLUMN "learning_mode" TO "format";--> statement-breakpoint
ALTER TABLE "classes" RENAME COLUMN "admission_mode" TO "join_policy";