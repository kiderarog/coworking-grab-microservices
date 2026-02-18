import { Test, TestingModule } from '@nestjs/testing';
import { CoworkingService } from './coworking.service';

describe('CoworkingService', () => {
  let service: CoworkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoworkingService],
    }).compile();

    service = module.get<CoworkingService>(CoworkingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
