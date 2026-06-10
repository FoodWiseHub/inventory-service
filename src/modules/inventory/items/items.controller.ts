import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { InternalServiceGuard } from '../../../common/guards/internal-service.guard.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { ItemsService } from './items.service.js';

@Controller('internal/inventory/items')
@UseGuards(InternalServiceGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  list(
    @CurrentUserId()
    userId: string,
  ) {
    return this.itemsService.list(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUserId()
    userId: string,

    @UuidParam('id')
    itemId: string,
  ) {
    return this.itemsService.findOne(userId, itemId);
  }

  @Post()
  create(
    @CurrentUserId()
    userId: string,

    @Body()
    dto: CreateItemDto,
  ) {
    return this.itemsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUserId()
    userId: string,

    @UuidParam('id')
    itemId: string,

    @Body()
    dto: UpdateItemDto,
  ) {
    return this.itemsService.update(userId, itemId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUserId()
    userId: string,

    @UuidParam('id')
    itemId: string,
  ) {
    return this.itemsService.remove(userId, itemId);
  }
}
