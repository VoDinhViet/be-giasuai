import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CourseDetailLessonPartResDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  fileUrl: string;

  @ApiProperty()
  @Expose()
  partType: string;

  @ApiProperty()
  @Expose()
  position: number;
}
