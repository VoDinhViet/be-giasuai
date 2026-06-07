import {
  ClassFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '../../../decorators/field.decorators';
import {
  CourseLessonStatus,
  CourseLessonType,
  CourseLevel,
  CourseStatus,
} from '../constants/course.constant';

export class CreateCourseChapterReqDto {
  @StringFieldOptional({ description: 'Ma chuong', maxLength: 32 })
  chapterCode?: string;

  @StringField({ description: 'Ten chuong' })
  chapterTitle!: string;

  @NumberFieldOptional({ description: 'Thu tu chuong', min: 0, int: true })
  order?: number;
}

export class CreateCourseLessonReqDto {
  @StringFieldOptional({ description: 'Ma chuong lien ket', maxLength: 32 })
  chapterCode?: string;

  @StringField({ description: 'Ma bai hoc', maxLength: 32 })
  lessonCode!: string;

  @StringField({ description: 'Ten bai hoc' })
  lessonTitle!: string;

  @EnumFieldOptional(() => CourseLessonType, { description: 'Loai bai hoc' })
  lessonType?: CourseLessonType;

  @NumberFieldOptional({
    description: 'Thoi luong theo phut',
    min: 0,
    int: true,
  })
  durationMinutes?: number;

  @EnumFieldOptional(() => CourseLessonStatus, {
    description: 'Trang thai bai hoc',
  })
  status?: CourseLessonStatus;

  @NumberFieldOptional({ description: 'So tai nguyen', min: 0, int: true })
  resourceCount?: number;

  @NumberFieldOptional({ description: 'Thu tu bai hoc', min: 0, int: true })
  position?: number;
}

export class CreateCourseReqDto {
  @StringField({ description: 'Ma khoa hoc', maxLength: 32 })
  code!: string;

  @StringField({ description: 'Ten khoa hoc' })
  name!: string;

  @StringField({ description: 'Danh muc khoa hoc', maxLength: 120 })
  category!: string;

  @UUIDFieldOptional({ description: 'ID nguoi bien soan' })
  authorId?: string;

  @StringFieldOptional({ description: 'Mo ta khoa hoc', maxLength: 2000 })
  description?: string;

  @StringFieldOptional({ description: 'Doi tuong hoc vien', maxLength: 1000 })
  audience?: string;

  @EnumFieldOptional(() => CourseLevel, { description: 'Cap do khoa hoc' })
  level?: CourseLevel;

  @NumberFieldOptional({
    description: 'Thoi luong theo phut',
    min: 0,
    int: true,
  })
  durationMinutes?: number;

  @StringFieldOptional({ description: 'Ngay khai giang yyyy-MM-dd' })
  startDate?: string;

  @EnumFieldOptional(() => CourseStatus, { description: 'Trang thai khoa hoc' })
  status?: CourseStatus;

  @ClassFieldOptional(() => CreateCourseChapterReqDto, {
    description: 'Danh sach chuong tu file import',
    each: true,
  })
  chapters?: CreateCourseChapterReqDto[];

  @ClassFieldOptional(() => CreateCourseLessonReqDto, {
    description: 'Danh sach bai hoc tu file import',
    each: true,
  })
  lessons?: CreateCourseLessonReqDto[];
}
