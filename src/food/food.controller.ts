import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Controller()
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @MessagePattern('createFood')
  create(@Payload() createFoodDto: CreateFoodDto) {
    return this.foodService.create(createFoodDto);
  }

  @MessagePattern('findAllFood')
  findAll() {
    return this.foodService.findAll();
  }

  @MessagePattern('findOneFood')
  findOne(@Payload() id: number) {
    return this.foodService.findOne(id);
  }

  @MessagePattern('updateFood')
  update(@Payload() updateFoodDto: UpdateFoodDto) {
    return this.foodService.update(updateFoodDto.id, updateFoodDto);
  }

  @MessagePattern('removeFood')
  remove(@Payload() id: number) {
    return this.foodService.remove(id);
  }
}