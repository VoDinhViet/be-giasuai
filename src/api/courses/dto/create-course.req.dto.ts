import {
  ClassFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '../../../decorators/field.decorators';
import {
  LessonStatus,
  LessonType,
  CourseLevel,
  CourseStatus,
} from '../constants/course.constant';

export class CreateCourseSectionReqDto {
  @StringFieldOptional({ description: 'Ma phan', maxLength: 32 })
  sectionCode?: string;

  @StringField({ description: 'Ten phan' })
  sectionTitle!: string;

  @NumberFieldOptional({ description: 'Thu tu phan', min: 0, int: true })
  order?: number;
}

export class CreateLessonReqDto {
  @StringFieldOptional({ description: 'Ma phan lien ket', maxLength: 32 })
  sectionCode?: string;

  @StringField({ description: 'Ma bai hoc', maxLength: 32 })
  lessonCode!: string;

  @StringField({ description: 'Ten bai hoc' })
  lessonTitle!: string;

  @EnumFieldOptional(() => LessonType, { description: 'Loai bai hoc' })
  lessonType?: LessonType;

  @NumberFieldOptional({
    description: 'Thoi luong theo phut',
    min: 0,
    int: true,
  })
  durationMinutes?: number;

  @EnumFieldOptional(() => LessonStatus, {
    description: 'Trang thai bai hoc',
  })
  status?: LessonStatus;

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

  @ClassFieldOptional(() => CreateCourseSectionReqDto, {
    description: 'Danh sach phan tu file import',
    each: true,
  })
  sections?: CreateCourseSectionReqDto[];

  @ClassFieldOptional(() => CreateLessonReqDto, {
    description: 'Danh sach bai hoc tu file import',
    each: true,
  })
  lessons?: CreateLessonReqDto[];
}
