// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { DonationModule } from './donation/donation.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { DonationModule } from './donation/donation.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 주의: 프로덕션 환경에서는 false로 설정해야 합니다.
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ProjectModule,
    DonationModule,
    BlockchainModule,
    CommonModule,
  ],
})
export class AppModule {}
