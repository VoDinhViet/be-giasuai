ALTER TABLE "courses" RENAME COLUMN "instructor_id" TO "author_id";--> statement-breakpoint
ALTER TABLE "courses" RENAME CONSTRAINT "courses_instructor_id_users_id_fk" TO "courses_author_id_users_id_fk";
