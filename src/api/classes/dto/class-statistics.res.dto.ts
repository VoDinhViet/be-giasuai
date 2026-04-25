import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ClassStatisticsResDto {
  @ApiProperty({ example: 27 })
  @Expose()
  totalClasses: number;

  @ApiProperty({ example: 12 })
  @Expose()
  activeClasses: number;

  @ApiProperty({ example: 15 })
  @Expose()
  pausedClasses: number;

  @ApiProperty({ example: 120 })
  @Expose()
  totalStudents: number;
}
