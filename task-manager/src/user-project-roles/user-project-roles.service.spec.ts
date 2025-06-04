import { Test, TestingModule } from '@nestjs/testing';
import { UserProjectRolesService } from './user-project-roles.service';

describe('UserProjectRolesService', () => {
  let service: UserProjectRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProjectRolesService],
    }).compile();

    service = module.get<UserProjectRolesService>(UserProjectRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
