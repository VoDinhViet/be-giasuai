import { Expose, Type } from 'class-transformer';

import { CourseSectionWithLessonsResDto } from './course-section-with-lessons.res.dto';

export class CourseCurriculumResDto {
  @Type(() => CourseSectionWithLessonsResDto)
  @Expose()
  courseSections!: CourseSectionWithLessonsResDto[];
}
