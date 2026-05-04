import { ApiProperty } from '@nestjs/swagger';
import { AcademicNodeType } from './academic-node-type.enum';

export class AcademicCatalogItemResDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  parentId: string | null;

  @ApiProperty({ enum: AcademicNodeType, enumName: 'AcademicNodeType' })
  type: AcademicNodeType;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({
    type: () => AcademicCatalogItemResDto,
    isArray: true,
  })
  children: AcademicCatalogItemResDto[];
}
