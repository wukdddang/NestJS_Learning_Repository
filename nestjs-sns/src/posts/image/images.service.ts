import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from '../../common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { basename, join } from 'path';
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from '../../common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './dto/create-image.dto';
// import { PostsModel } from '../entities/posts.entity';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    // dto의 이미지 이름 기반으로 파일의 경로 생성
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);
    try {
      // 파일이 존재하는 지 확인
      // 만일 존재하지 않는다면 에러 던짐
      await promises.access(tempFilePath);
    } catch {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }

    // 파일의 이름만 가져오기
    // ex) /public/posts/xxx.jpg -> xxx.jpg
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    // ex) /public/posts/xxx.jpg
    const newPath = join(POST_IMAGE_PATH, fileName);

    // 파일 저장 로직
    const result = await repository.save({
      ...dto,
    });

    // 파일 이동
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
