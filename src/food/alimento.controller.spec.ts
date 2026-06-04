import { Test, TestingModule } from '@nestjs/testing';
import { AlimentoController } from './food.controller';
import { AlimentoService } from './food.service';

describe('AlimentoController', () => {
  let controller: AlimentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlimentoController],
      providers: [AlimentoService],
    }).compile();

    controller = module.get<AlimentoController>(AlimentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
