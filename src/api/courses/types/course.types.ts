import type { Database } from '../../../database/database.type';
import type { NewCourseSection } from '../../../database/schemas/courses/course-sections';
import type { NewLesson } from '../../../database/schemas/lessons/lessons';

export type CourseCreateTx = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

export type CreatedCourse = { id: string; code: string };

export type SectionInsertRow = Pick<
  NewCourseSection,
  'courseId' | 'code' | 'title' | 'position'
>;

export type LessonInsertRow = Pick<
  NewLesson,
  | 'courseId'
  | 'sectionId'
  | 'code'
  | 'title'
  | 'durationMinutes'
  | 'type'
  | 'status'
  | 'resourceCount'
  | 'position'
>;
