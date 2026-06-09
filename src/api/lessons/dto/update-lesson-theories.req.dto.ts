import { ApiProperty } from '@nestjs/swagger';

export class UpdateLessonTheoriesReqDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Danh sach cac file tai lieu ly thuyet (PDF/DOC/DOCX)',
  })
  files!: string[];
}
