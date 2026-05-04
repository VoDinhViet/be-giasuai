import { StringFieldOptional } from '../../../decorators/field.decorators';

export class GetCategorySubjectsReqDto {
  @StringFieldOptional({
    description: 'ID cấp học',
  })
  levelId?: string;

  @StringFieldOptional({
    description: 'ID khối lớp',
  })
  gradeId?: string;

  @StringFieldOptional({
    description: 'ID ngành',
  })
  majorId?: string;

  @StringFieldOptional({
    description: 'Từ khóa tên hoặc mã môn học',
  })
  q?: string;
}
