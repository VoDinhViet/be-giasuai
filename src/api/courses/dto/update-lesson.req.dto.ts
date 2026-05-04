import { PartialType } from '@nestjs/swagger';

import { CreateLessonReqDto } from './create-lesson.req.dto';

export class UpdateLessonReqDto extends PartialType(CreateLessonReqDto) {}
