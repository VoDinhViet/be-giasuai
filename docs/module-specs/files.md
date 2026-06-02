# Files Module Spec

## Purpose

The files module owns authenticated local file uploads used by modules that need a public file URL, including the current user-profile avatar handoff.

Source:

```text
src/api/files/
```

## Public API

All files endpoints require JWT authentication.

### POST /files/upload

Permissions:

- `Role.ADMIN`
- `Role.TEACHER`
- `Role.STUDENT`

Request:

- `multipart/form-data`
- Field: `file`
- Limit: `10MB`

Response:

- `url`
- `filename`
- `mimetype`
- `size`

Business rules:

- Stores the uploaded file under `uploads/` with a UUID filename and the original extension.
- Returns a URL that can be used by clients to display or link the uploaded file.
- Student upload is allowed so the user-profile frontend can upload avatar files.
- Persisting an avatar URL on the user profile is not implemented yet because the `users` schema does not currently include an `avatarUrl` field.

Errors:

- Missing file: `ErrorCode.E105`, HTTP `400`.

## Dependencies

- Multer disk storage
- `uploads/` static file serving configured by the application
- Files service upload response formatting

## Security Rules

- Upload requires authenticated user context.
- Role guard limits upload to Admin, Teacher, and Student.
- File size is limited to 10MB at the interceptor level.

## Verification

- `pnpm run build`
