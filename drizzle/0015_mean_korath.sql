ALTER TABLE "classes" RENAME COLUMN "teacher_id" TO "instructor_id";--> statement-breakpoint
ALTER TABLE "class_sessions" RENAME COLUMN "teacher_id" TO "instructor_id";--> statement-breakpoint
ALTER TABLE "classes" DROP CONSTRAINT "classes_teacher_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_sessions" DROP CONSTRAINT "class_sessions_teacher_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;