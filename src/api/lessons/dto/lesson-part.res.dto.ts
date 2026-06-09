import { Exclude, Expose } from 'class-transformer';

import {
  BooleanField,
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

@Exclude()
export class LessonPartResDto {
  @UUIDField({ description: 'ID phan noi dung bai hoc' })
  @Expose()
  id: string;

  @StringField({ description: 'Ten phan noi dung' })
  @Expose()
  title: string;

  @StringField({ description: 'Loai phan noi dung' })
  @Expose()
  type: string;

  @StringField({ description: 'URL file ly thuyet' })
  @Expose()
  fileUrl: string;

  @StringField({ description: 'Ten file goc' })
  @Expose()
  originalName: string;

  @StringField({ description: 'MIME type cua file' })
  @Expose()
  mimeType: string;

  @NumberField({ description: 'Kich thuoc file theo byte' })
  @Expose()
  sizeBytes: number;

  @NumberField({ description: 'Thu tu hien thi' })
  @Expose()
  position: number;

  @BooleanField({ description: 'Trang thai hien thi' })
  @Expose()
  isPublished: boolean;
}
