import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  Request,
  // UploadedFile,
  BadRequestException,
  // ParseFilePipe,
  // MaxFileSizeValidator,
  // FileTypeValidator,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { ROLE } from 'src/user/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
// import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { MovieFilePipe } from './pipe/movie-file.pipe';
// import { diskStorage } from 'multer';
// import { join } from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import { UploadMovieFileDto } from './dto/upload-movie-file.dto';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Public()
  @Get()
  getMovies(@Query() dto: GetMoviesDto) {
    return this.movieService.findAll(dto);
  }

  @Public()
  @Get(':id')
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(+id);
  }

  // @Post('upload')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: join('public', 'movie'),
  //       filename: (req, file, callback) => {
  //         const split = file.originalname.split('.');
  //         let extension = 'mp4';
  //         if (split.length > 1) {
  //           extension = split[split.length - 1];
  //         }
  //         callback(null, `${Date.now()}-${uuidv4()}-${file.originalname}`);
  //       },
  //     }),
  //   }),
  // )
  // async uploadFile(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 100 }), // 100MB
  //         new FileTypeValidator({ fileType: /(mp4|mov|avi)$/ }),
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   const fileInfo: UploadMovieFileDto = {
  //     originalName: file.originalname,
  //     fileName: file.filename,
  //     filePath: join('public', 'movie', file.filename).replace(/\\/g, '/'),
  //   };
  //   return fileInfo;
  // }

  @Post()
  @RBAC(ROLE.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  postMovie(@Body() body: CreateMovieDto, @Request() req) {
    if (!body.movieFileName) {
      throw new BadRequestException('파일 정보가 필요합니다.');
    }
    return this.movieService.create(body, req.queryRunner);
  }

  @Patch(':id')
  @RBAC(ROLE.PAID_USER)
  patchMovie(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDto) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(ROLE.ADMIN)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }
}
