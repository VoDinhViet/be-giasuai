import { OrderBy } from '../../../constants/app.constant';
import {
  BooleanFieldOptional,
  EnumFieldOptional,
} from '../../../decorators/field.decorators';
import { PageOptionsDto } from '../../../common/offset-pagination/page-options.dto';

export class GetClassesReqDto extends PageOptionsDto {
  @BooleanFieldOptional({
    description: 'Loc theo trang thai hoat dong cua lop',
  })
  readonly isActive?: boolean;

  @EnumFieldOptional(() => OrderBy, {
    description: 'Sap xep theo thoi gian tao: DESC moi nhat, ASC cu nhat',
    default: OrderBy.DESC,
  })
  readonly order?: OrderBy = OrderBy.DESC;
}
