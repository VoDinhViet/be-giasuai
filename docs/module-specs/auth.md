# Auth Module Spec

## Purpose

The auth module owns public identity entrypoints: login, registration OTP, password reset OTP, refresh-token rotation, access-token verification, and logout.

Source:

```text
src/api/auth/
```

## Public API

### POST /auth/login

Request DTO:

- `LoginReqDto`

Response DTO:

- `LoginResDto`

Business rules:

- Accepts email or username plus password.
- User must exist, password must match, and `users.isLocked` must be `false`.
- Creates a database session and returns access/refresh tokens.
- Locked, unverified, or pending-teacher accounts cannot log in.

Errors:

- Invalid credentials: `ErrorCode.E004`, HTTP `401`.
- Locked/pending account: `ErrorCode.E005`, HTTP `401`.

### POST /auth/register

Request DTO:

- `RegisterReqDto`

Response DTO:

- `RegisterResDto`

Business rules:

- Public registration allows only `STUDENT` and `TEACHER`.
- Public `ADMIN` registration is rejected.
- Email and username must be unique.
- New public users are created with `isLocked = true`.
- A 6-digit registration OTP is hashed and cached.
- Student accounts are unlocked after OTP verification.
- Teacher accounts remain locked after OTP verification until Admin verifies the teacher.

Errors:

- Duplicate email/username: `ErrorCode.E001`, HTTP `400`.
- Public admin registration: `ErrorCode.E007`, HTTP `403`.
- OTP request cooldown: `ErrorCode.V003`, HTTP `429`.

### POST /auth/register/otp

Request DTO:

- `RequestRegistrationOtpReqDto`

Response DTO:

- `OtpChallengeResDto`

Business rules:

- Reissues registration OTP for an existing locked user.
- Applies OTP resend cooldown.
- Does not create users.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.
- OTP request cooldown: `ErrorCode.V003`, HTTP `429`.

### POST /auth/register/verify-otp

Request DTO:

- `VerifyRegistrationOtpReqDto`

Response DTO:

- `VerifyRegistrationOtpResDto`

Business rules:

- OTP must match the cached hash and be unexpired.
- Student OTP verification unlocks the user.
- Teacher OTP verification marks OTP as accepted by returning `requiresAdminVerification = true`; the teacher remains locked until Admin verification.
- Used OTP cache entry is deleted after success.

Errors:

- Missing user: `ErrorCode.E002`, HTTP `404`.
- Invalid/expired OTP: `ErrorCode.E006`, HTTP `400`.

### POST /auth/password-reset/otp

Request DTO:

- `RequestPasswordResetOtpReqDto`

Response DTO:

- `OtpChallengeResDto`

Business rules:

- Always returns the same success shape whether the email exists or not.
- Applies cooldown for every requested email to avoid account enumeration through rate-limit behavior.
- Stores a hashed OTP only when the email belongs to an existing user.

Errors:

- OTP request cooldown: `ErrorCode.V003`, HTTP `429`.

### POST /auth/password-reset

Request DTO:

- `ResetPasswordReqDto`

Response:

- No body.

Business rules:

- Email must exist and OTP must match the cached hash.
- Password is re-hashed before storage.
- All existing sessions for the user are deleted after password reset.
- Locked users can reset passwords, but remain locked.

Errors:

- Invalid/expired OTP or missing email: `ErrorCode.E006`, HTTP `400`.

### POST /auth/refresh-token

Request DTO:

- `RefreshTokenReqDto`

Response DTO:

- `LoginResDto`

Business rules:

- Refresh token must be valid and signed with `auth.refreshSecret`.
- Session must exist.
- Refresh-token hash must match the session hash.
- User must not be locked.
- Session hash is rotated and a new access/refresh token pair is returned.

Errors:

- Invalid refresh token/session/hash/locked user: `ErrorCode.E008`, HTTP `401`.

### POST /auth/logout

Request:

- Current JWT payload from `@User()`.

Response:

- No body.

Business rules:

- Deletes the current session.
- Blacklists the session ID in cache until access token expiry.

## Token And Session Rules

- Access tokens contain `userId`, `role`, and `sessionId`.
- Access-token verification checks JWT signature, cache blacklist, session existence, session owner, current user role, and `users.isLocked`.
- Refresh tokens contain `sessionId` and session `hash`.
- Locking a user or resetting their password deletes active sessions.

## Dependencies

- `JwtService`
- `ConfigService<AllConfigType>`
- Cache manager through `CACHE_MANAGER`
- Drizzle database client through `DRIZZLE`
- Schemas: `users`, `sessions`

## Security Rules

- Do not expose OTP values in API responses.
- OTP values are hashed before cache storage.
- Password reset request does not reveal whether an email exists.
- Public registration cannot create Admin accounts.
- Locked accounts cannot authenticate or continue using existing access tokens.

## Verification

- `pnpm test auth.service.spec.ts users.service.spec.ts --runInBand`
- `pnpm run build`
