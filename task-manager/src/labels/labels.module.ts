import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { Label, LabelSchema } from './schemas/label.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Label.name, schema: LabelSchema }])],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}
