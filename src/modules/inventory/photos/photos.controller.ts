import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { InternalServiceGuard } from '../../../common/guards/internal-service.guard.js';
import { PhotosService } from './photos.service.js';

@Controller('internal/inventory')
@UseGuards(InternalServiceGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('items/:itemId/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,

        fileSize: 5_000_000,
      },
    }),
  )
  upload(
    @CurrentUserId()
    userId: string,

    @UuidParam('itemId')
    itemId: string,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.photosService.upload(userId, itemId, file);
  }

  @Get('items/:itemId/photos')
  list(
    @CurrentUserId()
    userId: string,

    @UuidParam('itemId')
    itemId: string,
  ) {
    return this.photosService.list(userId, itemId);
  }

  @Delete('items/:itemId/photos/:photoId')
  remove(
    @CurrentUserId()
    userId: string,

    @UuidParam('itemId')
    itemId: string,

    @UuidParam('photoId')
    photoId: string,
  ) {
    return this.photosService.remove(userId, itemId, photoId);
  }

  @Get('photos/:photoId/content')
  async content(
    @CurrentUserId()
    userId: string,

    @UuidParam('photoId')
    photoId: string,

    @Query('variant')
    variant: 'image' | 'thumbnail' = 'thumbnail',

    @Res()
    response: Response,
  ) {
    const content = await this.photosService.getContent(
      userId,
      photoId,
      variant,
    );

    response.setHeader('Content-Type', content.mimeType);

    response.setHeader('Cache-Control', 'private, max-age=3600');

    response.send(content.buffer);
  }
}
