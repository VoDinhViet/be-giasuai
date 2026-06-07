ALTER TABLE "class_enrollments" RENAME COLUMN "student_id" TO "learner_id";--> statement-breakpoint
ALTER TABLE "class_attendance_records" RENAME COLUMN "student_id" TO "learner_id";--> statement-breakpoint
ALTER TABLE "class_enrollments" DROP CONSTRAINT "class_enrollments_student_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_attendance_records" DROP CONSTRAINT "class_attendance_records_student_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "class_enrollments_class_student_unique";--> statement-breakpoint
DROP INDEX "class_attendance_session_student_unique";--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_attendance_records" ADD CONSTRAINT "class_attendance_records_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "class_enrollments_class_learner_unique" ON "class_enrollments" USING btree ("class_id","learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "class_attendance_session_learner_unique" ON "class_attendance_records" USING btree ("session_id","learner_id");