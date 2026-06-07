import { relations, sql } from 'drizzle-orm';
import {
  boolean,
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

import { classEnrollments } from './class-enrollments';
import { classCourses } from './class-courses';
import { classSessions } from './class-sessions';
import { users } from '../users';

export const classStatusEnum = pgEnum('class_status', [
  'ACTIVE',
  'UPCOMING',
  'COMPLETED',
  'PAUSED',
]);

export const classFormatEnum = pgEnum('class_format', [
  'OFFLINE',
  'ONLINE',
  'HYBRID',
]);

export const classJoinPolicyEnum = pgEnum('class_join_policy', [
  'INVITE_ONLY',
  'REQUEST_APPROVAL',
  'OPEN',
]);

export const classWeekdayEnum = pgEnum('class_weekday', [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export const classes = pgTable(
  'classes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 32 }).notNull(),
    name: text('name').notNull(),
    instructorId: uuid('instructor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    maxStudents: integer('max_students').default(0).notNull(),
    meetingUrl: text('meeting_url'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    startTime: time('start_time'),
    endTime: time('end_time'),
    repeatDays: classWeekdayEnum('repeat_days')
      .array()
      .default(sql`ARRAY[]::class_weekday[]`)
      .notNull(),
    status: classStatusEnum('status').default('UPCOMING').notNull(),
    format: classFormatEnum('format').default('OFFLINE').notNull(),
    joinPolicy: classJoinPolicyEnum('join_policy')
      .default('REQUEST_APPROVAL')
      .notNull(),
    waitlistEnabled: boolean('waitlist_enabled').default(true).notNull(),
    reminderEnabled: boolean('reminder_enabled').default(true).notNull(),
    autoCreateSessions: boolean('auto_create_sessions').default(true).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex('classes_code_unique').on(table.code)],
);

export const classesRelations = relations(classes, ({ many, one }) => ({
  instructor: one(users, {
    fields: [classes.instructorId],
    references: [users.id],
  }),
  enrollments: many(classEnrollments),
  courses: many(classCourses),
  sessions: many(classSessions),
}));

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
