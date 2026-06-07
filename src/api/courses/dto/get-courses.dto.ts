import { PageOptionsDto } from '../../../common/offset-pagination/page-options.dto';
import {
  EnumFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { CourseStatus } from '../constants/course.constant';

export class GetCoursesDto extends PageOptionsDto {
  @EnumFieldOptional(() => CourseStatus)
  readonly status?: CourseStatus;

  @StringFieldOptional({ maxLength: 120 })
  readonly category?: string;
}
