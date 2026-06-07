import { BooleanField, UUIDField } from '../../../decorators/field.decorators';

export class AssignClassCourseReqDto {
  @UUIDField({ description: 'ID khoa hoc can them vao lop' })
  courseId!: string;

  @BooleanField({ description: 'Khoa hoc bat buoc trong lop' })
  required!: boolean;
}
