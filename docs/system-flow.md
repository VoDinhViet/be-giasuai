# System Flow

## Identity Access Flow

### Public Registration

1. Client calls `POST /auth/register` with email, username, password, full name, and role.
2. Backend rejects public `ADMIN` registration.
3. Backend creates the user with `isLocked = true` and creates the matching `user_profiles` row.
4. Backend stores a hashed 6-digit registration OTP in cache.
5. Client calls `POST /auth/register/verify-otp` with `userId` and OTP.
6. If the user is `LEARNER`, backend unlocks the account.
7. If the user is `INSTRUCTOR`, backend returns `requiresAdminVerification = true` and the account remains locked.
8. Instructor Admin verification API is deferred until product requirements are clear.

### Login And Sessions

1. Client calls `POST /auth/login` with email/username and password.
2. Backend validates credentials and rejects locked/pending accounts.
3. Backend creates a session row with a random hash.
4. Backend returns access token, refresh token, and token expiry.
5. Protected API calls verify JWT signature, session existence, session owner, current role, and `isLocked`.

### Basic RBAC

1. Protected controllers declare permissions with `@Permissions('resource:action')`.
2. `RolesGuard` reads required permission metadata after `AuthGuard` has attached the verified JWT payload.
3. The guard derives permission codes from the current user role through the static RBAC map.
4. `system:manage` grants broad Admin access.
5. `GET /auth/me`, login, and refresh-token responses expose role-derived `permissionCodes` for frontend authorization.

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
3. Backend returns `UserResDto` whitelist fields with required `profile` data from `user_profiles`.

### Update Current User Profile

1. Client calls `PATCH /users/me`.
2. Backend validates the request body with `UpdateUserReqDto`.
3. Backend reuses the shared user update flow with the authenticated user ID.
4. Backend rejects missing users and duplicate email/username values.
5. Backend hashes a changed password before saving.
6. Backend upserts profile fields into `user_profiles` and updates account fields in `users`.
7. Backend deletes active sessions when the request locks the account.

### Avatar Upload Handoff

1. Learner, Instructor, or Admin uploads through `POST /files/upload`.
2. Backend returns a public file URL.
3. Client persists the returned URL through `PATCH /users/me` as `avatarUrl`.

## Course Catalog Flow

### Create Course

1. Admin or Instructor calls `POST /courses` with code, name, category, optional course fields, chapters, and lessons already mapped to backend DTO values.
2. Backend validates the request body with `CreateCourseReqDto`.
3. Backend rejects duplicate course codes with HTTP `409`.
4. Backend inserts the course, inserts chapters into `course_chapters`, links lessons by `chapterCode`, inserts lessons into `course_lessons`, and returns `CourseResDto`.

### Course Management

1. Admin or Instructor calls `GET /courses` for paginated course listing.
2. Admin or Instructor calls `GET /courses/stats` for course dashboard metrics.
3. Admin or Instructor calls `GET /courses/:courseCode` for detail.
4. Admin or Instructor calls `PATCH /courses/:courseCode` to update whitelisted course fields.

## Classroom Management Flow

### Class Listing

1. An authenticated user calls `GET /classes` for paginated class listing.
2. Admin, Instructor, or Learner calls `GET /classes/stats` with the same filters and pagination for classroom dashboard cards.
3. Backend supports keyword search by class, course, and instructor names.
4. Backend supports filtering by class status, course ID, and instructor ID.
5. Learner class listing and stats are scoped to classes where the current user has an `ACTIVE` or `COMPLETED` enrollment.
6. Backend returns instructor, capacity, schedule, date range, and status for each class row.
7. Backend returns dashboard stats for total matched classes, current-page active classes, current-page active learner count, current-page upcoming classes, and pagination values.

### Class Course Assignment

1. Admin or Instructor opens class detail through `GET /classes/:classCode`.
2. Backend returns assigned courses from `class_courses` with `required`, lesson count, and placeholder completed lesson count, plus active learners and sessions for the detail view.
3. Admin or Instructor calls `POST /classes/:classCode/courses` with `courseId` and `required`.
4. Backend verifies the class and course exist, rejects duplicate assignments, and inserts the class-course row.
5. Backend stores all class-course membership in `class_courses`; the `classes` table does not store a course foreign key.

### Invite Learner To Class

1. Admin or Instructor opens class enrollment management through `GET /classes/:classCode/enrollments`.
2. Admin or Instructor calls `POST /classes/:classCode/enrollments/invite` with the learner's email and optional note.
3. Backend finds an existing Learner user by email and rejects missing or non-learner accounts.
4. Backend creates a `PENDING` class enrollment with `source = INVITE`, or reopens a previous pending/rejected/dropped enrollment.
5. Backend rejects learners who are already active or completed in the class.
6. Email delivery is not wired yet; the endpoint currently persists the invite state for the management UI.

## Current Constraints

- OTP values are not exposed by the API and no email delivery provider is wired yet.
- Service package checks are intentionally not part of identity access yet.
- Class invitation email delivery is not integrated yet.
- Classroom update and richer course progress workflows remain pending product decisions.
