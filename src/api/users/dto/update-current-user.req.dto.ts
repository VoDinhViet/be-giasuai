import { StringFieldOptional } from '../../../decorators/field.decorators';

export class UpdateCurrentUserReqDto {
  @StringFieldOptional({
    description: 'Ho va ten hien thi cua nguoi dung',
    minLength: 2,
    maxLength: 120,
  })
  fullName?: string;
}
