import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationEventHelper } from './utils/notification-event.helper';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    JwtModule,
    EmailModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, NotificationEventHelper],
  exports: [NotificationsService, NotificationsGateway, NotificationEventHelper],
})
export class NotificationsModule {}
