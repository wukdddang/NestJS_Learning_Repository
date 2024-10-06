import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectEntity } from '../../project/entities/project.entity';
import { DonationEntity } from '../../donation/entities/donation.entity';

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProjectEntity, (project) => project.creator)
  projects: ProjectEntity[];

  @OneToMany(() => DonationEntity, (donation) => donation.donor)
  donations: DonationEntity[];
}
