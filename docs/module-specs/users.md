# Users Module Spec

## Purpose

The users module owns current-user profile reads and Admin account management for identity-access.

Source:

```text
src/api/users/
```

## Public API

All users endpoints require JWT authentication. Admin management endpoints use role-derived permission checks.

### GET /users/me

Response DTO:

- `UserResDto`

Business rules:

- Returns the current authenticated user profile.
- Includes required extended profile data in `profile`.
- Throws when the current user no longer exists.
- Does not expose password hashes, sessions, OTP data, or tokens.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### PATCH /users/me

Request DTO:

- `UpdateCurrentUserReqDto`

Response DTO:

- `UserResDto`

Business rules:

- Updates only current-user profile fields.
- Supports `fullName`, phone, location, bio, and avatar URL.
- Extended profile fields are stored in the existing `user_profiles` row for the user.
- Does not allow changing email, username, role, lock status, password, sessions, tokens, or OTP data.
- Returns the current user when no updatable field is provided.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### GET /users

Permissions:

- `users:read`

Query DTO:

- `GetUsersDto`

Response:

- `OffsetPaginatedDto<UserResDto>`

Business rules:

- Supports offset pagination.
- Supports keyword filtering by email, username, and full name.
- Supports filtering by role and lock status.
- Excludes Admin accounts from the list response.
- Sorts by `createdAt` using the requested order.

### GET /users/stats

Permissions:

- `users:read`

Response DTO:

- `UserStatsResDto`

Business rules:

- Returns total, new, active, and locked user counts.

### GET /users/:userId

Permissions:

- `users:read`

Response DTO:

- `UserResDto`

Business rules:

- Returns one user profile by ID.
- Includes required extended profile data in `profile`.
- Does not expose password hashes, sessions, OTP data, or tokens.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### PATCH /users/:userId

Permissions:

- `users:manage`

Request DTO:

- `UpdateUserReqDto`

Response DTO:

- `UserResDto`

Business rules:

- User must exist.
- Admin can update whitelisted account fields: email, username, full name, password, role, and lock status.
- Email and username must remain unique.
- Password is hashed before saving when provided.
- When `isLocked` is set to `true`, all active sessions for that user are deleted.
- Response never exposes password hashes, sessions, OTP data, or tokens.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.
- Duplicate email/username: `ErrorCode.E001`, HTTP `409`.

### PATCH /users/:userId/toggle-lock

Permissions:

- `users:manage`

Response DTO:

- `UserResDto`

Business rules:

- User must exist.
- Flips the current `users.isLocked` value on the server.
- When the result is locked, all active sessions for that user are deleted.
- When the result is unlocked, no session is created.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### POST /users

Permissions:

- `users:manage`

Request DTO:

- `CreateUserDto`

Response DTO:

- `UserResDto`

Business rules:

- Creates users directly by Admin.
- Creates the matching `user_profiles` row in the same transaction.
- Email and username must be unique.
- Admin-created accounts are not forced through public OTP verification.

Errors:

- Duplicate email/username: `ErrorCode.E001`, HTTP `409`.

## Dependencies

- Drizzle database client through `DRIZZLE`
- Schemas: `users`, `sessions`, `user_profiles`
- `user_profiles.user_id` is the primary key and cascades when the owning user is deleted.
- Every user creation path must create the matching `user_profiles` row before returning.
- Shared offset pagination DTOs
- Files module for avatar upload handoff.

## Security Rules

- Admin-only account management routes use `@Permissions(...)` with role-derived RBAC.
- Responses whitelist fields through `UserResDto`.
- Locking a user revokes active sessions.
- Current-user profile update is whitelist-based and cannot mutate identity, role, password, lock, token, or session fields.

## Verification

- `pnpm test users.service.spec.ts --runInBand`
- `pnpm run build`
