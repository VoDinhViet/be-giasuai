# System Flow

## Identity Access Flow

### Public Registration

1. Client calls `POST /auth/register` with email, username, password, full name, and role.
2. Backend rejects public `ADMIN` registration.
3. Backend creates the user with `isLocked = true`.
4. Backend stores a hashed 6-digit registration OTP in cache.
5. Client calls `POST /auth/register/verify-otp` with `userId` and OTP.
6. If the user is `STUDENT`, backend unlocks the account.
7. If the user is `TEACHER`, backend returns `requiresAdminVerification = true` and the account remains locked.
8. Admin verifies a Teacher through `PATCH /users/:userId/verify-teacher`, which unlocks the Teacher account.

### Login And Sessions

1. Client calls `POST /auth/login` with email/username and password.
2. Backend validates credentials and rejects locked/pending accounts.
3. Backend creates a session row with a random hash.
4. Backend returns access token, refresh token, and token expiry.
5. Protected API calls verify JWT signature, session existence, session owner, current role, and `isLocked`.

### Refresh Token

1. Client calls `POST /auth/refresh-token`.
2. Backend validates refresh token signature.
3. Backend checks the session exists and token hash matches the session hash.
4. Backend rejects locked users.
5. Backend rotates the session hash and returns a new token pair.

### Logout

1. Client calls `POST /auth/logout`.
2. Backend deletes the current session.
3. Backend blacklists the session ID in cache until access token expiry.

### Password Reset

1. Client calls `POST /auth/password-reset/otp` with email.
2. Backend applies cooldown for the requested email.
3. Backend stores a hashed OTP only if the email belongs to an existing user.
4. Client calls `POST /auth/password-reset` with email, OTP, and new password.
5. Backend validates OTP, updates the password hash, deletes active sessions, and deletes the OTP cache entry.

## User Profile Flow

### Current User Profile

1. Client calls `GET /users/me`.
2. Backend loads the authenticated user by JWT payload user ID.
3. Backend returns `UserResDto` whitelist fields.

### Update Current User Profile

1. Client calls `PATCH /users/me`.
2. Backend accepts only profile fields. Current implementation supports `fullName`.
3. Backend rejects missing users and never mutates email, username, role, lock status, password, sessions, tokens, or OTP data.

### Avatar Upload Handoff

1. Student, Teacher, or Admin uploads through `POST /files/upload`.
2. Backend returns a public file URL.
3. Persisting the URL as a user avatar requires a future `avatarUrl` schema/migration step.

## Course Content Flow

### Course Discovery

1. Client calls `GET /courses` with pagination, optional keyword, optional publish filter, and sort order.
2. Backend searches course title, slug, and description.
3. Backend returns `CourseResDto` rows with offset pagination metadata.

### Course Reading

1. Client calls `GET /courses/:courseId`.
2. Client calls `GET /courses/:courseId/sections` to render sections and lessons.
3. Client calls `GET /courses/:courseId/lessons/:lessonId` to render paginated lesson parts.
4. Backend validates that the lesson belongs to the requested course before returning lesson parts.

### Course Management

1. Admin creates a course through `POST /courses`.
2. Backend generates a unique slug and stores an optional thumbnail under `uploads/`.
3. Admin updates course metadata through `PATCH /courses/:courseId`.
4. Admin deletes a course through `DELETE /courses/:courseId`; database cascades remove course content.

### Curriculum Sync

1. Admin sends `PUT /courses/:courseId/curriculum` with a JSON `courseSections` payload and optional dynamic lesson-part files.
2. Backend validates the course exists.
3. Backend deletes current sections in a transaction, relying on cascades for lessons and lesson parts.
4. Backend recreates sections, lessons, and lesson parts by array order.
5. Client can fetch the editable curriculum through `GET /courses/:courseId/curriculum`.

## Current Constraints

- OTP values are not exposed by the API and no email delivery provider is wired yet.
- Teacher verification uses `users.isLocked` for the current backend phase.
- Service package checks are intentionally not part of identity access yet.
- User avatar persistence is not implemented yet because the current `users` schema has no `avatarUrl` field.
- Course classification fields are accepted by course create/update requests but are not persisted yet because the current `courses` schema has no classification columns.
- Course simulator runtime, Teacher content authoring, Admin moderation, and graded exercises are deferred to later module phases.
