import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Role, UserModel } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ProfileModel } from './entity/profile.entity';
import { PostModel } from './entity/post.entity';
import { TagModel } from './entity/tag.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Post('sample')
  async sample() {
    // 모델에 해당되는 객체 생성 - 저장은 안함
    const user1 = this.userRepository.create({
      email: 'temp@fdsafsd.com',
    });

    // const user2 = await this.userRepository.save({
    //   email: 'fdsafsd@fdsafsd.com',
    // });

    // preload
    // 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
    // 추가 입력된 값으로 데이터베이스에서 가져온 값들을 대체한다.
    // 저장하지는 않는다.

    // const user3 = await this.userRepository.preload({
    //   id: 101,
    //   email: 'wuk@wuk.com',
    // });

    // 삭제하기
    // await this.userRepository.delete(101);

    // // 값을 증가한다.
    // await this.userRepository.increment(
    //   {
    //     id: 3,
    //   },
    //   'count',
    //   100,
    // );

    // // 값을 감소한다.

    // await this.userRepository.decrement({ id: 1 }, 'count', 1);

    // 갯수 카운팅하기.
    // const count = await this.userRepository.count({
    //   where: {
    //     email: ILike('%0%'),
    //   },
    // });

    // sum
    // const sum = await this.userRepository.sum('count', {
    //   id: LessThanOrEqual(3),
    // });

    // average
    // const average = await this.userRepository.average('count', {
    //   id: LessThanOrEqual(3),
    // });

    // min
    // const min = await this.userRepository.minimum('count', {
    //   id: LessThanOrEqual(3),
    // });

    // max
    // const max = await this.userRepository.maximum('count', {
    //   id: LessThanOrEqual(3),
    // });

    // const users = await this.userRepository.find({})

    // const userOne = await this.userRepository.findOne({
    //   where: {
    //     id: 3,
    //   },
    // });

    const usersAndCount = await this.userRepository.findAndCount({
      take: 3,
    });

    return usersAndCount;
  }

  @Post('users')
  async postUser() {
    for (let i = 0; i < 100; i++) {
      await this.userRepository.save({
        email: `user-${i}@google.com`,
      });
    }
  }

  @Get('users')
  getUsers() {
    return this.userRepository.find({
      order: {
        id: 'ASC',
      },
      where: {
        // 아닌 경우 가져오기
        // id: Not(1),
        // 적은 경우 가져오기
        // id: LessThan(30),
        // 같거나 적은 경우 가져오기
        // id: LessThanOrEqual(30),
        // id: MoreThan(30),
        // id: MoreThanOrEqual(30),
        // id: Equal(30),
        // email: Like('%0%'),
        // 대문자 소문자 구분 없이 가져오기
        // email: ILike('%GOOGLE%'),
        // 사이값
        // id: Between(10, 20),
        // 해당되는 여러개의 값
        // id: In([1, 3, 66]),
        // NULL인 경우
        // id: IsNull(),
      },

      // 어떤 프로퍼티를 선택할 지 정의한다.
      // 기본은 모든 프로퍼티를 가져온다.
      // 만약에 select를 정의하지 않으면 모든 프로퍼티를 가져온다.
      // select를 정의하면 정의한 프로퍼티만 가져온다.
      // select: {
      //   id: true,
      //   createdAt: true,
      //   updatedAt: true,
      //   version: true,
      //   profile: {
      //     id: true,
      //   },
      // },

      // 필터링할 조건을 입력한다.
      // where: {
      //   profile: {
      //     id: 3,
      //   },
      // },

      // 관계를 가져오는 법
      // relations를 추가하면 select나 where에서도 관계에 대한 조건을 추가할 수 있다.
      // relations: {
      //   profile: true,
      // },

      // 오름차순 내림차순 정렬
      // ASC: 오름차순, DESC: 내림차순
      // order: {
      //   id: 'DESC',
      // },

      // 처음 몇 개를 제외할지
      // skip: 0,
      // 몇 개를 가져올지
      // take: 2,
    });
  }

  @Patch('users/:id')
  async patchUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: parseInt(id),
      },
    });

    return this.userRepository.save({
      ...user,
      email: user.email + '0',
    });
  }

  @Delete('user/profile/:id')
  async deleteUserAndProfile(@Param('id') id: string) {
    await this.profileRepository.delete(+id);
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'adr@fdsafsd.com',
      profile: {
        profileImg: 'profile.png',
      },
    });

    return user;
  }

  @Post('user/post')
  async createUserAndPosts() {
    const user = await this.userRepository.save({
      email: 'postuser@adfsa.com',
    });

    await this.postRepository.save({
      author: user,
      title: 'post 1',
    });

    await this.postRepository.save({
      author: user,
      title: 'post 2',
    });

    return user;
  }

  @Post('posts/tags')
  async createPostsTags() {
    const post1 = await this.postRepository.save({
      title: 'NestJS',
    });

    const post2 = await this.postRepository.save({
      title: 'Programming',
    });

    const tag1 = await this.tagRepository.save({
      name: 'JavaScript',
      posts: [post1, post2],
    });

    const tag2 = await this.tagRepository.save({
      name: 'TypeScript',
      posts: [post1],
    });

    const post3 = await this.postRepository.save({
      title: 'NextJS',
      tags: [tag1, tag2],
    });

    return true;
  }

  @Get('posts')
  getPosts() {
    return this.postRepository.find({
      relations: {
        tags: true,
      },
    });
  }

  @Get('tags')
  getTags() {
    return this.tagRepository.find({
      relations: {
        posts: true,
      },
    });
  }
}
