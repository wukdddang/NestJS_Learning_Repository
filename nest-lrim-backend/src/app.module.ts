import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicantModule } from './applicant/applicant.module';
import { InterviewModule } from './interview/interview.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [ApplicantModule, InterviewModule, EvaluationModule, ReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
