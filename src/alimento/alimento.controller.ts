import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AlimentoService } from './alimento.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';

@Controller()
export class AlimentoController {
  constructor(private readonly alimentoService: AlimentoService) {}

  @MessagePattern('createAlimento')
  create(@Payload() createAlimentoDto: CreateAlimentoDto) {
    return this.alimentoService.create(createAlimentoDto);
  }

  @MessagePattern('findAllAlimento')
  findAll() {
    return this.alimentoService.findAll();
  }

  @MessagePattern('findOneAlimento')
  findOne(@Payload() id: number) {
    return this.alimentoService.findOne(id);
  }

  @MessagePattern('updateAlimento')
  update(@Payload() updateAlimentoDto: UpdateAlimentoDto) {
    return this.alimentoService.update(updateAlimentoDto.id, updateAlimentoDto);
  }

  @MessagePattern('removeAlimento')
  remove(@Payload() id: number) {
    return this.alimentoService.remove(id);
  }
}
