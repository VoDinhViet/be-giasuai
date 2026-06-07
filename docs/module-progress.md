# Module Progress

## Identity Access

Status: `in-progress`

Completed in backend:

- Login checks locked/pending accounts.
- Public registration blocks Admin role, creates locked accounts, and issues registration OTP.
- Registration OTP verify unlocks Learner accounts.
- Instructor accounts remain locked after OTP; Admin verification API is currently removed until product needs this flow.
- Password reset OTP request/reset endpoints are implemented.
- Password reset deletes active sessions.
- Refresh token endpoint validates and rotates session hash.
- Access-token verification checks session existence, current role, and lock status.
- `GET /users/me` and Admin user detail load users through Drizzle relation query with required `profile` data.
- `PATCH /users/me` reuses the same update flow as Admin user update through `UpdateUserReqDto`.
- User update supports account/profile fields, hashes changed passwords, updates `user_profiles`, and revokes sessions when locking.
- Admin toggle-lock flips account lock state server-side and returns the updated user.
- User stats return `UserStatsResDto` through `plainToInstance`.
- User response DTOs omit permission codes; Auth responses still return role-derived permission codes.
- Extended user profiles persist phone, location, bio, and avatar URL in required `user_profiles` rows.
- Demo user seed creates one Admin, one Instructor, and ten Learners with password `12345678`.
- Basic RBAC permissions are derived from roles and enforced with `@Permissions(...)`.
- Login, refresh-token, and `/auth/me` responses expose role-derived permission codes.

Known limits:

- OTP delivery service is not integrated yet; API stores hashed OTP in cache but does not send email.
- Instructor verification is deferred until product requirements are clear.
- Permission persistence and package-level entitlements are deferred to `service-packages`.

Verification:

- `pnpm test auth.service.spec.ts users.service.spec.ts --runInBand`
- `pnpm run build`

## Other Modules

- `user-profiles`: `done`
  - Backend done: current profile read/detail, Admin user detail, required extended profile row creation/backfill, account/profile update through shared user update flow, Learner file upload access for avatar handoff.
  - Frontend done: current-user profile page/update form, account-menu profile link, Admin user detail page link from user table.
  - Pending: activity summary requires data model/product decisions.
- `learning-delivery`: `planned`
- `assessments-grading`: `planned`
- `ai-personalization`: `planned`
- `learning-analytics`: `planned`
- `course-content`: `in-progress`
  - Backend done: course schema, list/detail/stats/update endpoints, create course-tree endpoint, duplicate code validation, focused controller/service specs.
  - Pending: persistent permission model remains deferred.
- `classroom-management`: `in-progress`
  - Backend done: class schema without direct course foreign key or class-level room, class-course many-course assignment schema, class enrollment schema, class sessions and attendance schemas, grouped `classes/` and `courses/` database schema folders, paginated class list endpoint with keyword/status filters, classroom dashboard stats endpoint, create/detail/delete/session/enrollment endpoints, paginated class-course listing endpoint, add-course-to-class endpoint, invite-learner-to-class endpoint.
  - Pending: update class API, remove course from class API, richer course progress tracking.
- `platform-admin`: `planned`
- `service-packages`: `planned-later`
