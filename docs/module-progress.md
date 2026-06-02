# Module Progress

## Identity Access

Status: `in-progress`

Completed in backend:

- Login checks locked/pending accounts.
- Public registration blocks Admin role, creates locked accounts, and issues registration OTP.
- Registration OTP verify unlocks Student accounts.
- Teacher accounts remain locked after OTP and can be verified by Admin.
- Password reset OTP request/reset endpoints are implemented.
- Password reset deletes active sessions.
- Refresh token endpoint validates and rotates session hash.
- Access-token verification checks session existence, current role, and lock status.
- Admin lock/unlock validates body and deletes sessions when locking.

Known limits:

- OTP delivery service is not integrated yet; API stores hashed OTP in cache but does not send email.
- Teacher verification currently uses `users.isLocked` instead of a dedicated verification table to avoid adding migrations while existing migration files are dirty.
- Role/permission remains role-enum based; package levels are deferred to `service-packages`.

Verification:

- `pnpm test auth.service.spec.ts users.service.spec.ts --runInBand`
- `pnpm run build`

## Other Modules

- `user-profiles`: `in-progress`
  - Backend done: current profile read/update `fullName`, Admin user detail, Student file upload access for avatar handoff.
  - Frontend done: current-user profile page/update form, account-menu profile link, Admin user detail page link from user table.
  - Pending: persistent `avatarUrl` and activity summary require data model/migration decisions.
- `course-content`: `in-progress`
  - Backend done: course list/detail/search, section/lesson listing, lesson parts, Admin course create/update/delete, Admin curriculum sync, course spec and focused service tests.
  - Pending: frontend alignment, published-only public scope, teacher authoring, simulator runtime, graded exercises, and Admin moderation.
- `learning-delivery`: `planned`
- `assessments-grading`: `planned`
- `ai-personalization`: `planned`
- `learning-analytics`: `planned`
- `classroom-management`: `in-progress`
- `platform-admin`: `planned`
- `service-packages`: `planned-later`
