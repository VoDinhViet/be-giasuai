import {
  NumberFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class UpdateCourseSectionReqDto {
  @StringFieldOptional({ description: 'Ten chuong hoc' })
  title?: string;

  @StringFieldOptional({ description: 'Mo ta chuong hoc' })
  description?: string;

  @NumberFieldOptional({
    description: 'Thu tu hien thi cua chuong hoc',
    int: true,
    min: 1,
  })
  position?: number;
}
