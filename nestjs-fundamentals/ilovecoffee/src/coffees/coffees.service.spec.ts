import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesService } from './coffees.service';

describe('CoffeesService', () => {
  let service: CoffeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoffeesService],
    }).compile();

    service = module.get<CoffeesService>(CoffeesService);
    // Request 스코프 또는 Transient 스코프 provider 를 사용하는 경우
    // service = await module.resolve(CoffeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
