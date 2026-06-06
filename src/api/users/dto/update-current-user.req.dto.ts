import { StringFieldOptional } from '../../../decorators/field.decorators';

export class UpdateCurrentUserReqDto {
  @StringFieldOptional({
    description: 'Ho va ten hien thi cua nguoi dung',
    minLength: 2,
    maxLength: 120,
  })
  fullName?: string;

  @StringFieldOptional({
    description: 'So dien thoai',
    maxLength: 32,
  })
  phone?: string;

  @StringFieldOptional({
    description: 'Khu vuc sinh song/hoc tap',
    maxLength: 160,
  })
  location?: string;

  @StringFieldOptional({
    description: 'Gioi thieu ngan',
    maxLength: 1000,
  })
  bio?: string;

  @StringFieldOptional({
    description: 'URL anh dai dien',
    maxLength: 1000,
  })
  avatarUrl?: string;
}
