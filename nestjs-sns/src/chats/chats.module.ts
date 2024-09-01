import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatsModel]), CommonModule],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
