import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { courses } from '../courses/courses';

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
    required: boolean('required').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('class_courses_class_course_unique').on(
      table.classId,
      table.courseId,
    ),
  ],
);

export const classCoursesRelations = relations(classCourses, ({ one }) => ({
  class: one(classes, {
    fields: [classCourses.classId],
    references: [classes.id],
  }),
  course: one(courses, {
    fields: [classCourses.courseId],
    references: [courses.id],
  }),
}));

export type ClassCourse = typeof classCourses.$inferSelect;
export type NewClassCourse = typeof classCourses.$inferInsert;
