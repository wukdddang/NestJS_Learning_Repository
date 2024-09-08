import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UsersModel } from '../../users/entity/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { ImageModel } from '../../common/entity/image.entity';
import { CommentsModel } from '../comments/entity/comments.entity';
// import { Transform } from 'class-transformer';
// import { join } from 'path';
// import { POST_PUBLIC_IMAGE_PATH } from '../../common/const/path.const';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentContent: number;

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];

  @OneToMany((type) => ImageModel, (image) => image.post)
  images: ImageModel[];
}
