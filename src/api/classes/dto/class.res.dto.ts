import { Expose } from 'class-transformer';

import {
  BooleanField,
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@/decorators/field.decorators';
import { UserResDto } from '@/api/users/dto/user.res.dto';

export class ClassResDto {
  @UUIDField({ description: 'ID lớp học' })
  @Expose()
  id: string;

  @StringField({ description: 'Ten lop hoc' })
  @Expose()
  name: string;

  @StringField({ description: 'Ma lop hoc' })
  @Expose()
  code: string;

  @StringField({ description: 'Ma moi vao lop' })
  @Expose()
  inviteCode: string;

  @UUIDFieldOptional({ description: 'ID giao vien phu trach lop' })
  @Expose()
  teacherId?: string | null;

  @ClassFieldOptional(() => UserResDto, {
    description: 'Thong tin giao vien phu trach lop',
    nullable: true,
  })
  @Expose()
  teacher?: UserResDto | null;

  @StringFieldOptional({ description: 'Mo ta lop hoc' })
  @Expose()
  description?: string | null;

  @BooleanField({ description: 'Trang thai hoat dong' })
  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
