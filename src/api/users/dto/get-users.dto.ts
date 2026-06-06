import { UserRole } from '../../../constants/role.constant';
import {
  BooleanFieldOptional,
  EnumFieldOptional,
} from '../../../decorators/field.decorators';
import { PageOptionsDto } from '../../../common/offset-pagination/page-options.dto';

export class GetUsersDto extends PageOptionsDto {
  @EnumFieldOptional(() => UserRole)
  readonly role?: UserRole;

  @BooleanFieldOptional()
  readonly isLocked?: boolean;
}
