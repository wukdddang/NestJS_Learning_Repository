import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { v4 as uuid } from 'uuid';
import { rename } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MovieFilePipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  constructor(
    private readonly options: {
      // MB로 입력
      maxSize: number;
      mimeType: string;
    },
  ) {}
  async transform(value: Express.Multer.File, metadata: ArgumentMetadata): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 필드는 필수 입력 필드입니다.');
    }

    const byteSize = this.options.maxSize * 1024 * 1024;

    if (value.size > byteSize) {
      throw new BadRequestException(`${this.options.maxSize}MB 이하의 파일만 업로드 가능합니다.`);
    }

    if (value.mimetype !== this.options.mimeType) {
      throw new BadRequestException(`${this.options.mimeType} 파일만 업로드 가능합니다.`);
    }

    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }

    const filename = `${uuid()}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename);

    await rename(value.path, newPath);

    return {
      ...value,
      filename,
      path: newPath,
    };
  }
}
