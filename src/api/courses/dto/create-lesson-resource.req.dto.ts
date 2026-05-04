import {
  EnumFieldOptional,
  StringField,
  URLField,
} from '../../../decorators/field.decorators';

import { ResourceType } from './resource-type.enum';

export class CreateLessonResourceReqDto {
  @StringField({ description: 'Ten tai nguyen' })
  title: string;

  @EnumFieldOptional(() => ResourceType, { description: 'Loai tai nguyen' })
  resourceType?: ResourceType;

  @URLField({ description: 'Duong dan tai nguyen' })
  resourceUrl: string;
}
