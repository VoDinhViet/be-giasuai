import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { users } from './users';

export const classRegistrationStatusEnum = pgEnum('class_registration_status', [
  'active',
  'completed',
  'dropped',
]);

export const classRegistrations = pgTable(
  'class_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    registeredAt: timestamp('registered_at').defaultNow().notNull(),
    status: classRegistrationStatusEnum('status').default('active').notNull(),
  },
  (table) => ({
    classUserUnique: uniqueIndex('class_registrations_class_user_unique').on(
      table.classId,
      table.userId,
    ),
  }),
);

export const classRegistrationsRelations = relations(
  classRegistrations,
  ({ one }) => ({
    class: one(classes, {
      fields: [classRegistrations.classId],
      references: [classes.id],
    }),
    user: one(users, {
      fields: [classRegistrations.userId],
      references: [users.id],
    }),
  }),
);

export type ClassRegistration = typeof classRegistrations.$inferSelect;
export type NewClassRegistration = typeof classRegistrations.$inferInsert;
