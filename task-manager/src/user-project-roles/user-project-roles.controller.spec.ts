import { Test, TestingModule } from '@nestjs/testing';
import { UserProjectRolesController } from './user-project-roles.controller';

describe('UserProjectRolesController', () => {
  let controller: UserProjectRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProjectRolesController],
    }).compile();

    controller = module.get<UserProjectRolesController>(UserProjectRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
