import { StringField, StringFieldOptional } from '../../../decorators/field.decorators';

export class SyncCourseCurriculumReqDto {
  @StringField({
    description: 'JSON string of course sections, lessons, and lesson parts',
  })
  courseSections!: string;

  @StringFieldOptional({
    description: 'Client-sent course id, ignored in favor of route param',
  })
  courseId?: string;
}
