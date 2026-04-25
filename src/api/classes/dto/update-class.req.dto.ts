import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '..\..\../decorators/field.decorators';

export class UpdateClassReqDto {
  @StringFieldOptional({ description: 'Tên lớp học' })
  name?: string;

  @StringFieldOptional({ description: 'Mô tả lớp học' })
  description?: string;

  @BooleanFieldOptional({ description: 'Trạng thái hoạt động' })
  isActive?: boolean;
}
