import { Expose, Transform, plainToInstance } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import {
  ClassField,
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class UpdateCourseLessonPartReqDto {
  @StringField({ description: 'Tiêu đề phiên học' })
  @Expose()
  title: string;

  @IsOptional()
  @Expose()
  file?: string | unknown;
}

export class UpdateCourseLessonReqDto {
  @StringField({ description: 'Tiêu đề bài học' })
  @Expose()
  title: string;

  @ClassFieldOptional(() => UpdateCourseLessonPartReqDto, {
    each: true,
    description: 'Danh sách phiên học',
  })
  @Expose()
  lessonParts?: UpdateCourseLessonPartReqDto[];
}

export class UpdateCourseSectionReqDto {
  @StringField({ description: 'Tiêu đề chương' })
  @Expose()
  title: string;

  @ClassFieldOptional(() => UpdateCourseLessonReqDto, {
    each: true,
    description: 'Danh sách bài học',
  })
  @Expose()
  lessons?: UpdateCourseLessonReqDto[];
}

export class UpdateCourseCurriculumReqDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ClassField(() => UpdateCourseSectionReqDto, {
    each: true,
    description: 'Danh sách chương học',
  })
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return parsed;
    return parsed.map((section) =>
      plainToInstance(UpdateCourseSectionReqDto, section),
    );
  })
  @Expose()
  courseSections: UpdateCourseSectionReqDto[];
}
