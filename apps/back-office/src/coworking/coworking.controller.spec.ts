import { Test, TestingModule } from '@nestjs/testing';
import { CoworkingController } from './coworking.controller';
import { CoworkingService } from './coworking.service';

describe('CoworkingController', () => {
  let controller: CoworkingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoworkingController],
      providers: [CoworkingService],
    }).compile();

    controller = module.get<CoworkingController>(CoworkingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
