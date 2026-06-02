import {
  BooleanFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class CreateCourseReqDto {
  @StringField({
    description: 'Course title',
    minLength: 5,
    maxLength: 200,
  })
  title!: string;

  @StringFieldOptional({
    description: 'Course description',
    minLength: 1,
    maxLength: 5000,
  })
  description?: string;

  @StringFieldOptional({
    description: 'JSON array of course tags',
  })
  tags?: string;

  @StringFieldOptional({
    description: 'JSON array of learning outcomes',
  })
  learningOutcomes?: string;

  @BooleanFieldOptional({
    description: 'Published status',
  })
  isPublished?: boolean;

  @StringFieldOptional({ description: 'Accepted but not persisted yet' })
  levelId?: string;

  @StringFieldOptional({ description: 'Accepted but not persisted yet' })
  gradeId?: string;

  @StringFieldOptional({ description: 'Accepted but not persisted yet' })
  majorId?: string;

  @StringFieldOptional({ description: 'Accepted but not persisted yet' })
  subjectId?: string;
}
