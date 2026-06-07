import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { classSessions } from './class-sessions';
import { users } from '../users';

export const classAttendanceStatusEnum = pgEnum('class_attendance_status', [
  'PRESENT',
  'LATE',
  'ABSENT',
]);

export const classAttendanceRecords = pgTable(
  'class_attendance_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => classSessions.id, { onDelete: 'cascade' }),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: classAttendanceStatusEnum('status').default('PRESENT').notNull(),
    note: text('note'),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('class_attendance_session_learner_unique').on(
      table.sessionId,
      table.learnerId,
    ),
  ],
);

export const classAttendanceRecordsRelations = relations(
  classAttendanceRecords,
  ({ one }) => ({
    session: one(classSessions, {
      fields: [classAttendanceRecords.sessionId],
      references: [classSessions.id],
    }),
    learner: one(users, {
      fields: [classAttendanceRecords.learnerId],
      references: [users.id],
    }),
  }),
);

export type ClassAttendanceRecord = typeof classAttendanceRecords.$inferSelect;
export type NewClassAttendanceRecord =
  typeof classAttendanceRecords.$inferInsert;
