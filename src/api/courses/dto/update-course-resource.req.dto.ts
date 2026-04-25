import {
  EnumFieldOptional,
  StringFieldOptional,
  URLFieldOptional,
} from '..\..\../decorators/field.decorators';

import { ResourceType } from './resource-type.enum';

export class UpdateCourseResourceReqDto {
  @StringFieldOptional({ description: 'Ten tai nguyen' })
  title?: string;

  @EnumFieldOptional(() => ResourceType, { description: 'Loai tai nguyen' })
  resourceType?: ResourceType;

  @URLFieldOptional({ description: 'Duong dan tai nguyen' })
  resourceUrl?: string;
}
