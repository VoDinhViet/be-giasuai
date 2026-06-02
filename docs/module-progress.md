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

- `user-profiles`: `planned`
- `course-content`: `in-progress`
- `learning-delivery`: `planned`
- `assessments-grading`: `planned`
- `ai-personalization`: `planned`
- `learning-analytics`: `planned`
- `classroom-management`: `in-progress`
- `platform-admin`: `planned`
- `service-packages`: `planned-later`
