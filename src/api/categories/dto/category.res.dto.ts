import {
  EnumField,
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';
import { CategoryType } from '../../../database/schemas';

export class CategoryResDto {
  @UUIDField()
  id: string;

  @UUIDField({ nullable: true })
  parentId: string | null;

  @EnumField(() => CategoryType)
  type: CategoryType;

  @StringField()
  code: string;

  @StringField()
  name: string;

  @StringField({ nullable: true })
  description: string | null;

  @NumberField({ int: true })
  sortOrder: number;
}
