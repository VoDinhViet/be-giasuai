import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const courseObjectives = pgTable('course_objectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const courseObjectivesRelations = relations(
  courseObjectives,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseObjectives.courseId],
      references: [courses.id],
    }),
  }),
);

export type CourseObjective = typeof courseObjectives.$inferSelect;
export type NewCourseObjective = typeof courseObjectives.$inferInsert;
