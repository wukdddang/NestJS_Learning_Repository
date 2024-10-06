import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { DonationEntity } from '../../donation/entities/donation.entity';

@Entity()
export class ProjectEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.projects)
  creator: UserEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  targetAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentAmount: number;

  @OneToMany(() => DonationEntity, (donation) => donation.project)
  donations: DonationEntity[];
}
