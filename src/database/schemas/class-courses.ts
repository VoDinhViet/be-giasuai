import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { courses } from './courses/courses';
import { users } from './users';

export const classCourses = pgTable(
  'class_courses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    assignedBy: uuid('assigned_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    classCourseUnique: uniqueIndex('class_courses_class_course_unique').on(
      table.classId,
      table.courseId,
    ),
  }),
);

export type ClassCourse = typeof classCourses.$inferSelect;
export type NewClassCourse = typeof classCourses.$inferInsert;
