# Users Module Spec

## Purpose

The users module owns current-user profile reads and Admin account management for identity-access.

Source:

```text
src/api/users/
```

## Public API

All users endpoints require JWT authentication. Admin management endpoints require `Role.ADMIN`.

### GET /users/me

Response DTO:

- `UserResDto`

Business rules:

- Returns the current authenticated user profile.
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
- Current implementation supports `fullName`.
- Does not allow changing email, username, role, lock status, password, sessions, tokens, or OTP data.
- Returns the current user when no updatable field is provided.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### GET /users

Permissions:

- `Role.ADMIN`

Query DTO:

- `GetUsersDto`

Response:

- `OffsetPaginatedDto<UserResDto>`

Business rules:

- Supports offset pagination.
- Supports keyword filtering by email, username, and full name.
- Supports filtering by role and lock status.
- Sorts by `createdAt` using the requested order.

### GET /users/stats

Permissions:

- `Role.ADMIN`

Response DTO:

- `UserStatsResDto`

Business rules:

- Returns total, new, active, and locked user counts.

### GET /users/:userId

Permissions:

- `Role.ADMIN`

Response DTO:

- `UserResDto`

Business rules:

- Returns one user profile by ID.
- Does not expose password hashes, sessions, OTP data, or tokens.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### PATCH /users/:userId/lock

Permissions:

- `Role.ADMIN`

Request DTO:

- `ToggleUserLockReqDto`

Response:

- No body.

Business rules:

- User must exist.
- Updates `users.isLocked`.
- When locking a user, all active sessions for that user are deleted.
- Unlocking a user does not create a new session.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### PATCH /users/:userId/verify-teacher

Permissions:

- `Role.ADMIN`

Response DTO:

- `UserResDto`

Business rules:

- Target user must exist and have role `TEACHER`.
- Sets `users.isLocked = false`.
- This is the current Teacher verification mechanism until a dedicated teacher verification schema is added.

Errors:

- Missing/non-teacher target: `ErrorCode.E009`, HTTP `404`.

### DELETE /users/:userId

Permissions:

- `Role.ADMIN`

Response:

- No body.

Business rules:

- User must exist.
- Deletes the user row.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.

### POST /users

Permissions:

- `Role.ADMIN`

Request DTO:

- `CreateUserDto`

Response DTO:

- `UserResDto`

Business rules:

- Creates users directly by Admin.
- Email and username must be unique.
- Admin-created accounts are not forced through public OTP verification.

Errors:

- Duplicate email/username: `ErrorCode.E001`, HTTP `409`.

## Dependencies

- Drizzle database client through `DRIZZLE`
- Schemas: `users`, `sessions`
- Shared offset pagination DTOs
- Files module for avatar upload handoff. Persistent `avatarUrl` needs a future schema/migration decision.

## Security Rules

- Admin-only account management routes use `@Roles(Role.ADMIN)`.
- Responses whitelist fields through `UserResDto`.
- Locking a user revokes active sessions.
- Current-user profile update is whitelist-based and cannot mutate identity, role, password, lock, token, or session fields.

## Verification

- `pnpm test users.service.spec.ts --runInBand`
- `pnpm run build`
