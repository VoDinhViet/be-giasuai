import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '../../../constants/course.constant';
import { SimulationType } from './simulation-type.enum';

export class LessonResDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sectionId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  summary?: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiPropertyOptional()
  videoUrl?: string;

  @ApiPropertyOptional()
  theoryUrl?: string;

  @ApiProperty({ enum: LessonType })
  lessonType: LessonType;

  @ApiProperty({ enum: SimulationType })
  simulationType: SimulationType;

  @ApiProperty()
  simulationFileUrl: string;

  @ApiPropertyOptional()
  quizCode?: string;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  position: number;

  @ApiProperty()
  isPreview: boolean;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
