ALTER TYPE "user_role" RENAME VALUE 'STUDENT' TO 'LEARNER';--> statement-breakpoint
ALTER TYPE "user_role" RENAME VALUE 'TEACHER' TO 'INSTRUCTOR';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'LEARNER';
