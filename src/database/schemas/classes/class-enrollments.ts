import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { users } from '../users';

export const classEnrollmentStatusEnum = pgEnum('class_enrollment_status', [
  'PENDING',
  'ACTIVE',
  'COMPLETED',
  'DROPPED',
  'REJECTED',
]);

export const classEnrollmentSourceEnum = pgEnum('class_enrollment_source', [
  'CODE',
  'INVITE',
]);

export const classEnrollments = pgTable(
  'class_enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: classEnrollmentStatusEnum('status').default('ACTIVE').notNull(),
    source: classEnrollmentSourceEnum('source').default('CODE').notNull(),
    note: text('note'),
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    reviewedAt: timestamp('reviewed_at'),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('class_enrollments_class_learner_unique').on(
      table.classId,
      table.learnerId,
    ),
  ],
);

export const classEnrollmentsRelations = relations(
  classEnrollments,
  ({ one }) => ({
    class: one(classes, {
      fields: [classEnrollments.classId],
      references: [classes.id],
    }),
    learner: one(users, {
      fields: [classEnrollments.learnerId],
      references: [users.id],
    }),
  }),
);

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type NewClassEnrollment = typeof classEnrollments.$inferInsert;
