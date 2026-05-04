import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CourseDetailLessonPartResDto } from './course-detail-lesson-part.res.dto';

export class CourseDetailLessonResDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;


  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  @Expose()
  position: number;

  @ApiProperty()
  @Expose()
  isPreview: boolean;

  @ApiProperty({ type: () => CourseDetailLessonPartResDto, isArray: true })
  @Type(() => CourseDetailLessonPartResDto)
  @Expose()
  lessonParts: CourseDetailLessonPartResDto[];
}
