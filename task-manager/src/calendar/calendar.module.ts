import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [CalendarController],
})
export class CalendarModule {}
