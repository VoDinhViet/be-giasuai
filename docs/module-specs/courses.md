# Courses Module Spec

## Purpose

The courses module owns course-content read APIs and Admin content management for courses, sections, lessons, and lesson parts.

Source:

```text
src/api/courses/
```

## Public API

### GET /courses

Response:

- `OffsetPaginatedDto<CourseResDto>`

Business rules:

- Supports offset pagination.
- Supports keyword search by title, slug, and description.
- Supports optional `isPublished` filtering.
- Sorts by `createdAt`.

### GET /courses/:courseId

Response:

- `CourseDetailResDto`

Business rules:

- Returns one course by ID.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.

### GET /courses/:courseId/sections

Response:

- `CourseSectionWithLessonsResDto[]`

Business rules:

- Returns course sections sorted by `position`, then `createdAt`.
- Returns lessons inside each section sorted by `position`, then `createdAt`.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.

### GET /courses/:courseId/lessons/:lessonId

Response:

- `OffsetPaginatedDto<CourseLessonPartResDto>`

Business rules:

- Validates that the lesson belongs to the requested course.
- Returns lesson parts sorted by `position`, then `createdAt`.
- Supports offset pagination.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.
- Lesson not in course: `ErrorCode.E105`, HTTP `404`.

## Authenticated API

### POST /courses

Permissions:

- `Role.ADMIN`

Request:

- `multipart/form-data`
- Body DTO: `CreateCourseReqDto`
- File field: `thumbnail`

Response:

- `CourseDetailResDto`

Business rules:

- Creates a course with a generated unique slug.
- Stores uploaded thumbnail as a local `uploads/*` path.
- Parses `tags` and `learningOutcomes` as JSON arrays.
- Accepts `levelId`, `gradeId`, `majorId`, and `subjectId` for frontend compatibility, but does not persist them because the current course schema has no classification columns.

### PATCH /courses/:courseId

Permissions:

- `Role.ADMIN`

Request:

- `multipart/form-data`
- Body DTO: `UpdateCourseReqDto`
- File field: `thumbnail`

Response:

- `CourseDetailResDto`

Business rules:

- Updates only provided fields.
- Regenerates a unique slug when title changes.
- Replaces the local thumbnail path when a new thumbnail is uploaded.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.

### GET /courses/:courseId/curriculum

Permissions:

- Authenticated user

Response:

- `CourseCurriculumResDto`

Business rules:

- Returns sections, lessons, and lesson parts for curriculum editing.
- Maps database relation `courseLessonParts` to response field `lessonParts`.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.

### PUT /courses/:courseId/curriculum

Permissions:

- `Role.ADMIN`

Request:

- `multipart/form-data`
- Body DTO: `SyncCourseCurriculumReqDto`
- `courseSections`: JSON array of sections, lessons, and lesson parts.
- Dynamic lesson-part file fields: `file_s{sectionIndex}_l{lessonIndex}_ss{partIndex}`.

Response:

- `CourseCurriculumResDto`

Business rules:

- Replaces the full curriculum for the course in one transaction.
- Deletes existing sections; cascading deletes existing lessons and lesson parts.
- Inserts sections, lessons, and lesson parts by array order.
- Uploaded lesson-part files are stored as local `uploads/*` paths.
- Existing `file` or `fileUrl` strings are preserved for lesson parts.
- Lesson parts without a title or file URL are skipped.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.
- Invalid `courseSections` JSON: `ErrorCode.V000`, HTTP `422`.

### DELETE /courses/:courseId

Permissions:

- `Role.ADMIN`

Response:

- No body.

Business rules:

- Deletes the course row.
- Cascading database rules delete sections, lessons, lesson parts, and class-course links.
- Removes local thumbnail files when possible.

Errors:

- Missing course: `ErrorCode.E105`, HTTP `404`.

## Dependencies

- Drizzle database client through `DRIZZLE`
- Schemas: `courses`, `courseSections`, `courseLessons`, `courseLessonParts`
- Multer disk storage for thumbnails and lesson-part files
- Static serving of `uploads/`

## Current Limits

- Public course APIs can still return draft courses when the client does not pass `isPublished=true`; stricter published-only public reads are deferred until management/search scopes are separated.
- Course classification fields are accepted but not persisted.
- Teacher authoring, Admin moderation workflow, simulator runtime, and graded exercises are not implemented in this module phase.

## Verification

- `pnpm test courses.service.spec.ts --runInBand`
- `pnpm run build`
