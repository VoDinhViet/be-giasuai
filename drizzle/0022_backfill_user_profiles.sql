INSERT INTO "user_profiles" ("user_id")
SELECT "users"."id"
FROM "users"
LEFT JOIN "user_profiles" ON "user_profiles"."user_id" = "users"."id"
WHERE "user_profiles"."user_id" IS NULL;
