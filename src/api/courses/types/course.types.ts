import type { Database } from '../../../database/database.type';
import type { NewCourseChapter } from '../../../database/schemas/courses/course-chapters';
import type { NewCourseLesson } from '../../../database/schemas/courses/course-lessons';

export type CourseCreateTx = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

export type CreatedCourse = { id: string; code: string };

export type ChapterInsertRow = Pick<
  NewCourseChapter,
  'courseId' | 'code' | 'title' | 'position'
>;

export type LessonInsertRow = Pick<
  NewCourseLesson,
  | 'courseId'
  | 'chapterId'
  | 'code'
  | 'title'
  | 'durationMinutes'
  | 'type'
  | 'status'
  | 'resourceCount'
  | 'position'
>;
