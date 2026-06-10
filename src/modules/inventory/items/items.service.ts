import { HttpStatus, Injectable } from '@nestjs/common';
import { CategoryScope } from '../../../generated/prisma/client.js';
import { AppException } from '../../../common/errors/app.exception.js';
import { ErrorCode } from '../../../common/errors/error-codes.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import type { CreateItemDto } from './dto/create-item.dto.js';
import type { UpdateItemDto } from './dto/update-item.dto.js';

@Injectable()
export class ItemsService {
  private readonly photoSelect = {
    id: true,
    mimeType: true,
    width: true,
    height: true,
    isPrimary: true,
    position: true,
    createdAt: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          expiresAt: 'asc',
        },

        {
          createdAt: 'desc',
        },
      ],

      include: {
        category: true,

        photos: {
          orderBy: [
            {
              isPrimary: 'desc',
            },

            {
              position: 'asc',
            },
          ],

          select: this.photoSelect,
        },
      },
    });
  }

  async findOne(userId: string, itemId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id: itemId,

        userId,
      },

      include: {
        category: true,

        photos: {
          orderBy: [
            {
              isPrimary: 'desc',
            },

            {
              position: 'asc',
            },
          ],

          select: this.photoSelect,
        },
      },
    });

    if (!item) {
      throw new AppException(
        ErrorCode.ITEM_NOT_FOUND,
        'Alimento nao encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return item;
  }

  async create(userId: string, dto: CreateItemDto) {
    await this.ensureCategoryAccessible(userId, dto.categoryId);

    const item = await this.prisma.inventoryItem.create({
      data: {
        userId,

        name: dto.name.trim(),

        brand: dto.brand?.trim(),

        categoryId: dto.categoryId,

        quantity: dto.quantity,

        unit: dto.unit,

        storageLocation: dto.storageLocation,

        manufacturedAt: this.toDate(dto.manufacturedAt),

        expiresAt: this.toDate(dto.expiresAt),

        openedAt: this.toDate(dto.openedAt),

        notes: dto.notes?.trim(),
      },

      select: {
        id: true,
      },
    });

    return this.findOne(userId, item.id);
  }

  async update(userId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id: itemId,

        userId,
      },

      select: {
        id: true,
        version: true,
      },
    });

    if (!item) {
      throw new AppException(
        ErrorCode.ITEM_NOT_FOUND,
        'Alimento nao encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (item.version !== dto.expectedVersion) {
      throw this.itemVersionConflict();
    }

    await this.ensureCategoryAccessible(userId, dto.categoryId);

    const result = await this.prisma.inventoryItem.updateMany({
      where: {
        id: itemId,

        userId,

        version: dto.expectedVersion,
      },

      data: {
        name: dto.name?.trim(),

        brand: dto.brand?.trim(),

        categoryId: dto.categoryId,

        quantity: dto.quantity,

        unit: dto.unit,

        storageLocation: dto.storageLocation,

        manufacturedAt: this.toDate(dto.manufacturedAt),

        expiresAt: this.toDate(dto.expiresAt),

        openedAt: this.toDate(dto.openedAt),

        notes: dto.notes?.trim(),

        version: {
          increment: 1,
        },
      },
    });

    if (result.count === 0) {
      throw this.itemVersionConflict();
    }

    return this.findOne(userId, itemId);
  }

  async remove(userId: string, itemId: string) {
    const item = await this.findOne(userId, itemId);

    await this.prisma.inventoryItem.deleteMany({
      where: {
        id: item.id,

        userId,
      },
    });

    return {
      success: true,
    };
  }

  private async ensureCategoryAccessible(userId: string, categoryId?: string) {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.inventoryCategory.findFirst({
      where: {
        id: categoryId,

        isActive: true,

        OR: [
          {
            scope: CategoryScope.SYSTEM,

            ownerUserId: null,
          },

          {
            scope: CategoryScope.USER,

            ownerUserId: userId,
          },
        ],
      },
    });

    if (!category) {
      throw new AppException(
        ErrorCode.INVALID_CATEGORY,
        'Categoria invalida ou inacessivel',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private itemVersionConflict() {
    return new AppException(
      ErrorCode.ITEM_VERSION_CONFLICT,
      'O alimento foi alterado em outro dispositivo. Atualize os dados antes de salvar novamente.',
      HttpStatus.CONFLICT,
    );
  }

  private toDate(value?: string) {
    return value ? new Date(value) : undefined;
  }
}
