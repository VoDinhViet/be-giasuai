import {
  StringField,
  StringFieldOptional,
} from '..\..\../decorators/field.decorators';

export class CreateClassReqDto {
  @StringField({ description: 'Ten lop hoc' })
  name: string;

  @StringFieldOptional({ description: 'Mo ta lop hoc' })
  description?: string;
}
