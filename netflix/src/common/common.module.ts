import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        /// ..../netflix/public/movie/
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, callback) => {
          const split = file.originalname.split('.');

          let extension = 'mp4';

          if (split.length > 1) {
            extension = split[split.length - 1];
          }

          callback(null, `${uuid()}_${Date.now()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
