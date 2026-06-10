import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { AppException } from '../../../common/errors/app.exception.js';
import { ErrorCode } from '../../../common/errors/error-codes.js';
import { logSafeError } from '../../../common/logging/safe-logger.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { SupabaseStorageService } from '../../../infra/storage/supabase-storage.service.js';

@Injectable()
export class PhotosService {
  private readonly maxInputBytes = 5_000_000;

  private readonly maxInputPixels = 12_000_000;

  constructor(
    private readonly prisma: PrismaService,

    private readonly storage: SupabaseStorageService,
  ) {}

  private readonly publicPhotoSelect = {
    id: true,
    mimeType: true,
    imageBytes: true,
    thumbnailBytes: true,
    width: true,
    height: true,
    sha256: true,
    isPrimary: true,
    position: true,
    createdAt: true,
  };

  async upload(userId: string, itemId: string, file?: Express.Multer.File) {
    await this.ensureItemOwnership(userId, itemId);

    if (!file) {
      throw new AppException(
        ErrorCode.PHOTO_REQUIRED,
        'Imagem obrigatoria',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (file.size > this.maxInputBytes) {
      throw new AppException(
        ErrorCode.PHOTO_TOO_LARGE,
        'A imagem excede o limite de 5 MB',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const fileType = await fileTypeFromBuffer(file.buffer);

    if (
      !fileType ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)
    ) {
      throw new AppException(
        ErrorCode.INVALID_PHOTO_TYPE,
        'Envie uma imagem JPEG, JPG, PNG ou WebP valida',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    let source: sharp.Sharp;

    try {
      source = sharp(file.buffer, {
        limitInputPixels: this.maxInputPixels,
      }).rotate();

      const metadata = await source.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Dimensoes ausentes');
      }
    } catch {
      throw new AppException(
        ErrorCode.INVALID_PHOTO,
        'Nao foi possivel processar a imagem',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const photoId = randomUUID();

    const baseKey = `users/${userId}/items/${itemId}/${photoId}`;

    const imageKey = `${baseKey}/image.webp`;

    const thumbnailKey = `${baseKey}/thumbnail.webp`;

    const imageBuffer = await source
      .clone()
      .resize({
        width: 1024,

        height: 1024,

        fit: 'inside',

        withoutEnlargement: true,
      })
      .webp({
        quality: 78,
      })
      .toBuffer();

    const thumbnailBuffer = await source
      .clone()
      .resize({
        width: 256,

        height: 256,

        fit: 'cover',
      })
      .webp({
        quality: 72,
      })
      .toBuffer();

    if (
      imageBuffer.length > this.maxInputBytes ||
      thumbnailBuffer.length > this.maxInputBytes
    ) {
      throw new AppException(
        ErrorCode.PHOTO_TOO_LARGE,
        'A imagem processada excede o limite de 5 MB',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const imageMetadata = await sharp(imageBuffer).metadata();

    const currentPhotos = await this.prisma.inventoryItemPhoto.count({
      where: {
        itemId,
      },
    });

    try {
      await Promise.all([
        this.storage.upload(imageKey, imageBuffer, 'image/webp'),

        this.storage.upload(thumbnailKey, thumbnailBuffer, 'image/webp'),
      ]);

      return await this.prisma.inventoryItemPhoto.create({
        data: {
          id: photoId,

          itemId,

          imageKey,

          thumbnailKey,

          mimeType: 'image/webp',

          imageBytes: imageBuffer.length,

          thumbnailBytes: thumbnailBuffer.length,

          width: imageMetadata.width ?? 0,

          height: imageMetadata.height ?? 0,

          sha256: createHash('sha256').update(imageBuffer).digest('hex'),

          isPrimary: currentPhotos === 0,

          position: currentPhotos,
        },

        select: this.publicPhotoSelect,
      });
    } catch (error) {
      await this.storage.remove([imageKey, thumbnailKey]).catch(() => {
        logSafeError({
          service: 'inventory-service',
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          errorCode: ErrorCode.STORAGE_UNAVAILABLE,
          userId,
          occurredAt: new Date().toISOString(),
        });
      });

      throw error;
    }
  }

  async list(userId: string, itemId: string) {
    await this.ensureItemOwnership(userId, itemId);

    return this.prisma.inventoryItemPhoto.findMany({
      where: {
        itemId,
      },

      select: this.publicPhotoSelect,

      orderBy: [
        {
          isPrimary: 'desc',
        },

        {
          position: 'asc',
        },
      ],
    });
  }

  async remove(userId: string, itemId: string, photoId: string) {
    await this.ensureItemOwnership(userId, itemId);

    const photo = await this.prisma.inventoryItemPhoto.findFirst({
      where: {
        id: photoId,

        itemId,
      },
    });

    if (!photo) {
      throw new AppException(
        ErrorCode.PHOTO_NOT_FOUND,
        'Foto nao encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.storage.remove([photo.imageKey, photo.thumbnailKey]);

    await this.prisma.inventoryItemPhoto.delete({
      where: {
        id: photo.id,
      },
    });

    if (photo.isPrimary) {
      const nextPhoto = await this.prisma.inventoryItemPhoto.findFirst({
        where: {
          itemId,
        },

        orderBy: {
          position: 'asc',
        },
      });

      if (nextPhoto) {
        await this.prisma.inventoryItemPhoto.update({
          where: {
            id: nextPhoto.id,
          },

          data: {
            isPrimary: true,
          },
        });
      }
    }

    return {
      success: true,
    };
  }

  async getContent(
    userId: string,
    photoId: string,
    variant: 'image' | 'thumbnail',
  ) {
    const photo = await this.prisma.inventoryItemPhoto.findFirst({
      where: {
        id: photoId,

        item: {
          userId,
        },
      },
    });

    if (!photo) {
      throw new AppException(
        ErrorCode.PHOTO_NOT_FOUND,
        'Foto nao encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    const key = variant === 'image' ? photo.imageKey : photo.thumbnailKey;

    return {
      buffer: await this.storage.download(key),
      mimeType: photo.mimeType,
    };
  }

  private async ensureItemOwnership(userId: string, itemId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        id: itemId,

        userId,
      },

      select: {
        id: true,
      },
    });

    if (!item) {
      throw new AppException(
        ErrorCode.ITEM_NOT_FOUND,
        'Alimento nao encontrado',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
