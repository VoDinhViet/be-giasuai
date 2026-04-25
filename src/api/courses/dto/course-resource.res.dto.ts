import { Expose } from 'class-transformer';

import {
  EnumField,
  StringField,
  URLField,
  UUIDField,
} from '../../../decorators/field.decorators';

import { ResourceType } from './resource-type.enum';

export class CourseResourceResDto {
  @UUIDField({ description: 'ID tai nguyen' })
  @Expose()
  id: string;

  @UUIDField({ description: 'ID bai hoc' })
  @Expose()
  lessonId: string;

  @StringField({ description: 'Ten tai nguyen' })
  @Expose()
  title: string;

  @EnumField(() => ResourceType, { description: 'Loai tai nguyen' })
  @Expose()
  resourceType: ResourceType;

  @URLField({ description: 'Duong dan tai nguyen' })
  @Expose()
  resourceUrl: string;

  @Expose()
  createdAt: Date;
}
