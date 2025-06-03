import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

/// ManyToOne Director -> 감독은 여러개의 영화를 만들 수 있음.
/// OneToOne MovieDetail -> 영화는 하나의 상세 내용을 가질 수 있음.
/// ManyToMany Genre -> 영화는 여러개의 장르를 가질 수 있고 장르는 여러개의 영화에 속할 수 있음.

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies, {
    cascade: true, // 영화 생성할 때 장르 정보를 직접 생성하지 않고 영화만 생성해도 장르 정보를 생성할 수 있음.
  })
  @JoinTable()
  genres: Genre[];

  @Column({ default: 0 })
  likeCount: number;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // 영화 생성할 때 detail 정보를 직접 생성하지 않고 영화만 생성해도 detail 정보를 생성할 수 있음.
    nullable: false,
  })
  @JoinColumn()
  detail: MovieDetail;

  @Column({ nullable: false })
  movieFilePath: string;

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: true, // 영화 생성할 떄 감독 정보를 직접 생성하지 않고 영화만 생성해도 감독 정보를 생성할 수 있음.
    nullable: false,
  })
  director: Director;
}
