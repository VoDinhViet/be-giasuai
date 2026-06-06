# Module Progress

## Identity Access

Status: `in-progress`

Completed in backend:

- Login checks locked/pending accounts.
- Public registration blocks Admin role, creates locked accounts, and issues registration OTP.
- Registration OTP verify unlocks Student accounts.
- Teacher accounts remain locked after OTP; Admin verification API is currently removed until product needs this flow.
- Password reset OTP request/reset endpoints are implemented.
- Password reset deletes active sessions.
- Refresh token endpoint validates and rotates session hash.
- Access-token verification checks session existence, current role, and lock status.
- Admin toggle-lock flips account lock state server-side and returns the updated user.
- Admin user update supports whitelisted account fields and revokes sessions when locking.
- Extended user profiles persist phone, location, bio, and avatar URL in required `user_profiles` rows.
- Basic RBAC permissions are derived from roles and enforced with `@Permissions(...)`.
- Login, refresh-token, `/auth/me`, and user profile responses expose role-derived permission codes.

Known limits:

- OTP delivery service is not integrated yet; API stores hashed OTP in cache but does not send email.
- Teacher verification is deferred until product requirements are clear.
- Permission persistence and package-level entitlements are deferred to `service-packages`.

Verification:

- `pnpm test auth.service.spec.ts users.service.spec.ts --runInBand`
- `pnpm run build`

## Other Modules

- `user-profiles`: `in-progress`
  - Backend done: current profile read/update `fullName`, Admin user detail, required extended profile row creation/backfill, extended profile update, Student file upload access for avatar handoff.
  - Frontend done: current-user profile page/update form, account-menu profile link, Admin user detail page link from user table.
  - Pending: persistent `avatarUrl` and activity summary require data model/migration decisions.
- `learning-delivery`: `planned`
- `assessments-grading`: `planned`
- `ai-personalization`: `planned`
- `learning-analytics`: `planned`
- `course-content`: `in-progress`
  - Backend done: course schema, list/detail/stats/update endpoints, create course-tree endpoint, duplicate code validation, focused controller/service specs.
  - Pending: persistent permission model remains deferred.
- `classroom-management`: `in-progress`
  - Backend done: class schema without direct course foreign key or class-level room, class-course many-course assignment schema, class enrollment schema, class sessions and attendance schemas, grouped `classes/` and `courses/` database schema folders, paginated class list endpoint with Student enrollment scoping, classroom dashboard stats endpoint with Student enrollment scoping, create/detail/session/enrollment endpoints, paginated class-course listing endpoint, add-course-to-class endpoint, invite-student-to-class endpoint, focused controller/service specs.
  - Pending: update class API, remove course from class API, richer course progress tracking.
- `platform-admin`: `planned`
- `service-packages`: `planned-later`
