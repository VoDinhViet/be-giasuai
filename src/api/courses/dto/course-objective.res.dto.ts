import { Exclude, Expose } from 'class-transformer';

import {
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

@Exclude()
export class CourseObjectiveResDto {
  @UUIDField({ description: 'ID muc tieu khoa hoc' })
  @Expose()
  id: string;

  @StringField({ description: 'Noi dung muc tieu' })
  @Expose()
  content: string;

  @NumberField({ description: 'Thu tu hien thi' })
  @Expose()
  position: number;
}
