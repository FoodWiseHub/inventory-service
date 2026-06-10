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
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Controller('internal/inventory/categories')
@UseGuards(InternalServiceGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(
    @CurrentUserId()
    userId: string,
  ) {
    return this.categoriesService.list(userId);
  }

  @Post()
  create(
    @CurrentUserId()
    userId: string,

    @Body()
    dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUserId()
    userId: string,

    @UuidParam('id')
    categoryId: string,

    @Body()
    dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(userId, categoryId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUserId()
    userId: string,

    @UuidParam('id')
    categoryId: string,
  ) {
    return this.categoriesService.remove(userId, categoryId);
  }
}
