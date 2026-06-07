import {
  EmailField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class InviteUserToClassReqDto {
  @EmailField({ description: 'Email hoc vien can moi vao lop' })
  email!: string;

  @StringFieldOptional({ description: 'Ghi chu loi moi', maxLength: 1000 })
  note?: string;
}
