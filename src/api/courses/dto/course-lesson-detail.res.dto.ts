import { Expose, Type } from 'class-transformer';

import {
  BooleanField,
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

export class CourseLessonPartResDto {
  @UUIDField({ description: 'ID session/tai lieu' })
  @Expose()
  id!: string;

  @UUIDField({ description: 'ID bai hoc' })
  @Expose()
  lessonId!: string;

  @StringField({ description: 'Ten session/tai lieu' })
  @Expose()
  title!: string;

  @StringField({ description: 'Loai tai lieu' })
  @Expose()
  partType!: 'PDF' | 'DOCX';

  @StringField({ description: 'URL tai lieu' })
  @Expose()
  fileUrl!: string;

  @NumberField({ description: 'Thu tu session/tai lieu', int: true, min: 1 })
  @Expose()
  position!: number;

  @BooleanField({ description: 'Trang thai xuat ban' })
  @Expose()
  isPublished!: boolean;
}

export class CourseLessonDetailResDto {
  @UUIDField({ description: 'ID bai hoc' })
  @Expose()
  id!: string;

  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  courseId!: string;

  @StringField({ description: 'Ten khoa hoc' })
  @Expose()
  courseTitle!: string;

  @UUIDField({ description: 'ID chuong hoc' })
  @Expose()
  sectionId!: string;

  @StringField({ description: 'Ten chuong hoc' })
  @Expose()
  sectionTitle!: string;

  @StringField({ description: 'Ten bai hoc' })
  @Expose()
  title!: string;

  @NumberField({ description: 'Thoi luong bai hoc', int: true, min: 0 })
  @Expose()
  durationMinutes!: number;

  @NumberField({ description: 'Thu tu bai hoc', int: true, min: 1 })
  @Expose()
  position!: number;

  @BooleanField({ description: 'Bai hoc xem thu' })
  @Expose()
  isPreview!: boolean;

  @BooleanField({ description: 'Trang thai xuat ban' })
  @Expose()
  isPublished!: boolean;

  @UUIDField({ description: 'ID bai hoc truoc', nullable: true })
  @Expose()
  previousLessonId!: string | null;

  @UUIDField({ description: 'ID bai hoc tiep theo', nullable: true })
  @Expose()
  nextLessonId!: string | null;

  @Type(() => CourseLessonPartResDto)
  @Expose()
  parts!: CourseLessonPartResDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
