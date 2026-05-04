import { relations } from 'drizzle-orm';
import { classes } from './classes';
import { classCourses } from './class-courses';
import { classEnrollments } from './class-enrollments';
import { users } from './users';
import { sessions } from './sessions';
import { courses } from './courses/courses';
import { courseSections } from './courses/course-sections';
import { lessons } from './courses/lessons';
import { lessonParts } from './courses/lesson-parts';
import { lessonResources } from './courses/lesson-resources';
import {
  gradeSubjects,
  grades,
  majors,
  majorSubjects,
  schoolLevels,
  subjects,
} from './academic-catalog';

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  assignedClassCourses: many(classCourses),
  classEnrollments: many(classEnrollments),
  teachingClasses: many(classes),
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
  classes: many(classCourses),
  courseSections: many(courseSections),
  schoolLevel: one(schoolLevels, {
    fields: [courses.schoolLevelId],
    references: [schoolLevels.id],
  }),
  grade: one(grades, {
    fields: [courses.gradeId],
    references: [grades.id],
  }),
  major: one(majors, {
    fields: [courses.majorId],
    references: [majors.id],
  }),
  subject: one(subjects, {
    fields: [courses.subjectId],
    references: [subjects.id],
  }),
}));

export const courseSectionsRelations = relations(
  courseSections,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseSections.courseId],
      references: [courses.id],
    }),
    lessons: many(lessons),
  }),
);

export const lessonsRelations = relations(
  lessons,
  ({ one, many }) => ({
    section: one(courseSections, {
      fields: [lessons.sectionId],
      references: [courseSections.id],
    }),
    lessonParts: many(lessonParts),
    resources: many(lessonResources),
  }),
);

export const lessonPartsRelations = relations(lessonParts, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonParts.lessonId],
    references: [lessons.id],
  }),
}));

export const lessonResourcesRelations = relations(
  lessonResources,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonResources.lessonId],
      references: [lessons.id],
    }),
  }),
);

export const schoolLevelsRelations = relations(schoolLevels, ({ many }) => ({
  grades: many(grades),
  majors: many(majors),
}));

export const gradesRelations = relations(grades, ({ one, many }) => ({
  schoolLevel: one(schoolLevels, {
    fields: [grades.schoolLevelId],
    references: [schoolLevels.id],
  }),
  subjects: many(gradeSubjects),
}));

export const majorsRelations = relations(majors, ({ one, many }) => ({
  schoolLevel: one(schoolLevels, {
    fields: [majors.schoolLevelId],
    references: [schoolLevels.id],
  }),
  subjects: many(majorSubjects),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  grades: many(gradeSubjects),
  majors: many(majorSubjects),
}));

export const gradeSubjectsRelations = relations(gradeSubjects, ({ one }) => ({
  grade: one(grades, {
    fields: [gradeSubjects.gradeId],
    references: [grades.id],
  }),
  subject: one(subjects, {
    fields: [gradeSubjects.subjectId],
    references: [subjects.id],
  }),
}));

export const majorSubjectsRelations = relations(majorSubjects, ({ one }) => ({
  major: one(majors, {
    fields: [majorSubjects.majorId],
    references: [majors.id],
  }),
  subject: one(subjects, {
    fields: [majorSubjects.subjectId],
    references: [subjects.id],
  }),
}));
