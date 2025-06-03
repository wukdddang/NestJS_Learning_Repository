import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 1024 * 1024 * 100, // 100MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'video/mp4') {
          return cb(new BadRequestException('mp4 파일만 업로드 가능합니다.'), false);
        }

        cb(null, true);
      },
    }),
  )
  async createVideo(@UploadedFile() movie: Express.Multer.File) {
    return {
      fileName: movie.filename,
    };
  }
}
