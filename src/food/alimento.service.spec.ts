import { Test, TestingModule } from '@nestjs/testing';
import { AlimentoService } from './food.service';

describe('AlimentoService', () => {
  let service: AlimentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlimentoService],
    }).compile();

    service = module.get<AlimentoService>(AlimentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
