import { StringField } from '@/decorators/field.decorators';

export class JoinClassReqDto {
  @StringField({ description: 'Mã mời vào lớp' })
  inviteCode: string;
}
