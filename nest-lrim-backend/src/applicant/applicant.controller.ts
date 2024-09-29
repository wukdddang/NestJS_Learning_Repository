import { Controller } from '@nestjs/common';
import { ApplicantService } from './applicant.service';

@Controller('applicant')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}
}
