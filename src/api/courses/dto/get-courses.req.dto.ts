import { PageOptionsDto } from '../../../common/offset-pagination/page-options.dto';
import { OrderBy } from '../../../constants/app.constant';
import {
  BooleanFieldOptional,
  EnumFieldOptional,
} from '../../../decorators/field.decorators';

export class GetCoursesReqDto extends PageOptionsDto {
  @BooleanFieldOptional({
    description: 'Loc theo trang thai xuat ban',
  })
  readonly isPublished?: boolean;


  @EnumFieldOptional(() => OrderBy, {
    description: 'Sap xep theo thoi gian tao: DESC moi nhat, ASC cu nhat',
    default: OrderBy.DESC,
  })
  readonly order?: OrderBy = OrderBy.DESC;
}
