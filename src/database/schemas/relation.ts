import { relations } from 'drizzle-orm';
import { classes } from './classes';
import { classCourses } from './class-courses';
import { classEnrollments } from './class-enrollments';
import { users } from './users';
import { sessions } from './sessions';
import { courses } from './courses';
import { courseSections } from './course-sections';
import { courseLessons } from './course-lessons';
import { courseResources } from './course-resources';
import { courseEnrollments } from './course-enrollments';
import { lessonProgress } from './lesson-progress';

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  assignedClassCourses: many(classCourses),
  classEnrollments: many(classEnrollments),
  teachingClasses: many(classes),
  taughtCourses: many(courses),
  courseEnrollments: many(courseEnrollments),
  lessonProgress: many(lessonProgress),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  courses: many(classCourses),
  enrollments: many(classEnrollments),
}));

export const classCoursesRelations = relations(classCourses, ({ one }) => ({
  class: one(classes, {
    fields: [classCourses.classId],
    references: [classes.id],
  }),
  course: one(courses, {
    fields: [classCourses.courseId],
    references: [courses.id],
  }),
  assignedByUser: one(users, {
    fields: [classCourses.assignedBy],
    references: [users.id],
  }),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classEnrollments.studentId],
    references: [users.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
  classes: many(classCourses),
  sections: many(courseSections),
  enrollments: many(courseEnrollments),
}));

export const courseSectionsRelations = relations(
  courseSections,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseSections.courseId],
      references: [courses.id],
    }),
    lessons: many(courseLessons),
  }),
);

export const courseLessonsRelations = relations(
  courseLessons,
  ({ one, many }) => ({
    section: one(courseSections, {
      fields: [courseLessons.sectionId],
      references: [courseSections.id],
    }),
    resources: many(courseResources),
    progress: many(lessonProgress),
  }),
);

export const courseResourcesRelations = relations(
  courseResources,
  ({ one }) => ({
    lesson: one(courseLessons, {
      fields: [courseResources.lessonId],
      references: [courseLessons.id],
    }),
  }),
);

export const courseEnrollmentsRelations = relations(
  courseEnrollments,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseEnrollments.courseId],
      references: [courses.id],
    }),
    student: one(users, {
      fields: [courseEnrollments.studentId],
      references: [users.id],
    }),
  }),
);

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(courseLessons, {
    fields: [lessonProgress.lessonId],
    references: [courseLessons.id],
  }),
  student: one(users, {
    fields: [lessonProgress.studentId],
    references: [users.id],
  }),
}));
