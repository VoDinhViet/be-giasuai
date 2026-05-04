import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { LessonType } from '../../../constants/course.constant';
import { SimulationType } from './simulation-type.enum';

export class CreateLessonReqDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  theoryUrl?: string;

  @IsEnum(LessonType)
  @IsNotEmpty()
  lessonType: LessonType;

  @IsEnum(SimulationType)
  @IsNotEmpty()
  simulationType: SimulationType;

  @IsString()
  @IsNotEmpty()
  simulationFileUrl: string;

  @IsString()
  @IsOptional()
  quizCode?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  position: number;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
