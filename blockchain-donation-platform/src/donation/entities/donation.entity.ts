import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ProjectEntity } from '../../project/entities/project.entity';

@Entity()
export class DonationEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.donations)
  donor: UserEntity;

  @ManyToOne(() => ProjectEntity, (project) => project.donations)
  project: ProjectEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;
}
