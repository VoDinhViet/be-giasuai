import { PageOptionsDto } from '../../../common/offset-pagination/page-options.dto';
import { EnumFieldOptional } from '../../../decorators/field.decorators';
import { ClassStatus } from '../constants/class.constant';

export class GetClassesDto extends PageOptionsDto {
  @EnumFieldOptional(() => ClassStatus)
  readonly status?: ClassStatus;
}
