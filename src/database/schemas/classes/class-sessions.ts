import { relations } from 'drizzle-orm';
import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { courses } from '../courses/courses';
import { users } from '../users';

export const classSessionStatusEnum = pgEnum('class_session_status', [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
]);

export const classSessions = pgTable(
  'class_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').references(() => courses.id, {
      onDelete: 'set null',
    }),
    instructorId: uuid('instructor_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    code: varchar('code', { length: 32 }).notNull(),
    title: text('title').notNull(),
    sessionDate: date('session_date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    room: varchar('room', { length: 120 }),
    status: classSessionStatusEnum('status').default('SCHEDULED').notNull(),
    position: integer('position').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('class_sessions_class_code_unique').on(
      table.classId,
      table.code,
    ),
  ],
);

export const classSessionsRelations = relations(classSessions, ({ one }) => ({
  class: one(classes, {
    fields: [classSessions.classId],
    references: [classes.id],
  }),
  course: one(courses, {
    fields: [classSessions.courseId],
    references: [courses.id],
  }),
  instructor: one(users, {
    fields: [classSessions.instructorId],
    references: [users.id],
  }),
}));

export type ClassSession = typeof classSessions.$inferSelect;
export type NewClassSession = typeof classSessions.$inferInsert;
