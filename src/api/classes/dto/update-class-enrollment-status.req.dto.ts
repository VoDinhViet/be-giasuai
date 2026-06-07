import { EnumField } from '../../../decorators/field.decorators';
import { ClassEnrollmentStatus } from '../constants/class.constant';

export class UpdateClassEnrollmentStatusReqDto {
  @EnumField(() => ClassEnrollmentStatus, {
    description: 'Trang thai moi cua yeu cau ghi danh',
  })
  status!: ClassEnrollmentStatus;
}
