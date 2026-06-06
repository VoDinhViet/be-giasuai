# AGENTS.md

## Role

- You are a backend coding agent for this NestJS API project.
- Respond in the user's language. Keep code, identifiers, and code comments in English.
- Keep changes scoped to the user request.
- Do not revert user changes or unrelated dirty worktree changes.
- Ask only when missing information changes behavior, data model, security, or public API.

## Source Of Truth

Read these files before non-trivial backend changes:

- `docs/architecture.md`
- `docs/system-flow.md`
- `docs/module-progress.md`
- `docs/standards/naming-standards.md`
- `docs/standards/typescript-standards.md`
- `docs/standards/nestjs-standards.md`
- `docs/standards/api-standards.md`
- `docs/standards/database-standards.md`

Keep docs lean. Do not recreate module plan/spec Markdown unless the user asks.

## Workflow

- Question/explanation: answer directly, no file edits.
- Docs/rules change: update only the relevant Markdown.
- Code change: inspect affected files, edit narrowly, verify, run `codegraph sync`, commit.
- New module: use Nest CLI for module/controller/service, remove generated spec unless tests are requested.
- Debugging: reproduce or read the exact error, fix root cause, rerun the failing command.
- Tests: do not add/update tests unless the user asks or the task is about tests.
- Commit after finishing a module/feature/fix. Push if possible; report credential failure if push fails.

## Command Safety

- Use `pnpm` for scripts.
- Before running a script, confirm it exists in `package.json` or run `pnpm run`.
- Do not guess scripts like `pnpm rundev`, `pnpm run dev`, or mixed-case script names.
- Backend server command is `pnpm run start:dev`.
- Build command is `pnpm run build`.
- Do not use `rm -rf node_modules`, `.next`, or lockfiles unless the user explicitly approves or the root cause requires it.
- Do not read or print sensitive files such as `~/.codex/auth.json` unless the task requires it.
- Do not move or delete config files without a clear backup and reason.
- If a command fails, read the root error before trying another command.

## Verification

- Run targeted tests when possible.
- Run `pnpm run build` when fixing build/type errors, changing dependency wiring, changing shared DTO/service behavior, or when the user asks.
- Do not build after docs-only changes.
- Always run `codegraph sync` after code changes, especially after adding files.
- Report commands run and pass/fail result.

## NestJS And DTO Rules

- Controllers stay thin: route decorators, auth/permission metadata, DTO params/body, one service call.
- Services own business rules, Drizzle queries, transactions, `AppException`, and response DTO mapping.
- Response mapping should use `plainToInstance(...)` directly unless a helper removes real duplication.
- DTO required fields use definite assignment `!`.
- DTO optional fields use `?`.
- Do not add constructors or fake defaults just to satisfy strict property initialization.
- `AppException` argument order is `ErrorCode`, `HttpStatus`, `message`.
- Do not return fields frontend does not use unless required by API contract.

## Drizzle Write Rules

- Prefer `db.query.<table>.findFirst/findMany` with `with:` relations when it reduces mapping.
- Prefer spread DTO writes when DTO fields match table columns.
- Override processed fields after spread.
- Do not spread a DTO into a table when the DTO contains fields for another table.
- For split writes, destructure or rest-pick table-specific values first.

Examples:

```ts
await tx.insert(users).values({
  ...dto,
  ...(dto.password ? { password: await hashPassword(dto.password) } : {}),
});
```

```ts
const {
  email: _email,
  username: _username,
  fullName: _fullName,
  password: _password,
  role: _role,
  isLocked: _isLocked,
  ...profileReqDto
} = reqDto;

const profileValues = { userId, ...profileReqDto };

await tx.insert(userProfiles).values(profileValues).onConflictDoUpdate({
  target: userProfiles.userId,
  set: profileValues,
});
```

## Users Module Current Rules

- Users and `user_profiles` are both required for user responses.
- `getUserById` uses Drizzle relation query with `profile`.
- User responses use `plainToInstance(UserResDto, ...)`.
- User responses do not return `permissionCodes`; auth responses may return role-derived permission codes.
- `PATCH /users/me` reuses `UsersService.update` with `UpdateUserReqDto`.
- `updateCurrentUser` and `UpdateCurrentUserReqDto` should not be reintroduced.
- User update may update account and profile fields, hashes changed password, upserts profile, and deletes sessions when locking.
- User stats return `plainToInstance(UserStatsResDto, ...)`.

## Seed Rules

- Seed scripts must be bounded and idempotent or bounded-reset by known seed identifiers.
- Never delete all users unless the user explicitly asks.
- For enum/schema changes, run `pnpm db:migrate` before seed.
- Current demo user seed creates one Admin, one Instructor, and ten Learners.
- Demo user password is `12345678`.

## Documentation Rules

- Keep only useful Markdown.
- `docs/architecture.md`: architecture and boundaries.
- `docs/system-flow.md`: current cross-module behavior.
- `docs/module-progress.md`: implementation status.
- `docs/standards/*.md`: reusable standards.
- Do not create duplicate planning/spec files when current docs already cover the need.
