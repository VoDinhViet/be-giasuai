import {
  NumberField,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class CreateCourseSectionReqDto {
  @StringField({ description: 'Ten chuong hoc' })
  title: string;

  @StringFieldOptional({ description: 'Mo ta chuong hoc' })
  description?: string;

  @NumberField({
    description: 'Thu tu hien thi cua chuong hoc',
    int: true,
    min: 1,
  })
  position: number;
}
