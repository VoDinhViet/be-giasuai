import { Expose, Type } from 'class-transformer';

import { UserResDto } from '@/api/users/dto/user.res.dto';
import { ClassField, NumberField } from '@/decorators/field.decorators';

import { ClassResDto } from './class.res.dto';

export class ClassDetailResDto extends ClassResDto {
  @NumberField({
    description: 'So luong hoc sinh trong lop',
    int: true,
    min: 0,
  })
  @Expose()
  studentCount: number;
}
