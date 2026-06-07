ALTER TABLE "classes" DROP CONSTRAINT "classes_instructor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "instructor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;