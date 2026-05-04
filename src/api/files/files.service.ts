import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '../../constants/error-code.constant';
import { AppException } from '../../exceptions/app.exception';
import { AllConfigType } from '../../config/config.type';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new AppException(
        ErrorCode.E105,
        'File not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const backendDomain = this.configService.get('app.backendDomain', { infer: true });
    const port = this.configService.get('app.port', { infer: true });
    
    // Construct the file URL
    // Assuming static files are served at /uploads
    const fileUrl = `${backendDomain}:${port}/uploads/${file.filename}`;

    return {
      url: fileUrl,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
