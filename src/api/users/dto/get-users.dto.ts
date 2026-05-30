import { Role } from '../../../constants/role.constant';
import {
  BooleanFieldOptional,
  EnumFieldOptional,
  UUIDFieldOptional,
} from '../../../decorators/field.decorators';
import { PageOptionsDto } from '../../../common/offset-pagination/page-options.dto';

export class GetUsersDto extends PageOptionsDto {
  @EnumFieldOptional(() => Role)
  readonly role?: Role;

  @BooleanFieldOptional()
  readonly isLocked?: boolean;

  @UUIDFieldOptional({ description: 'Loc nguoi dung theo ID lop hoc' })
  readonly classId?: string;
}
