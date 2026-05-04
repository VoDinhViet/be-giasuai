import { StringFieldOptional } from '../../../decorators/field.decorators';

export class GetAcademicSubjectsReqDto {
  @StringFieldOptional({
    description: 'Ma cap hoc, vi du PRIMARY hoac UNIVERSITY',
  })
  schoolLevelCode?: string;

  @StringFieldOptional({
    description: 'Ma khoi lop, vi du PRIMARY_GRADE_1',
  })
  gradeCode?: string;

  @StringFieldOptional({
    description: 'Ma nganh, vi du UNIV_IT',
  })
  majorCode?: string;

  @StringFieldOptional({
    description: 'Tu khoa ten hoac ma mon hoc',
  })
  q?: string;
}
