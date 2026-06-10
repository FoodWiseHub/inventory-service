import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ItemsModule } from './items/items.module.js';
import { PhotosModule } from './photos/photos.module.js';

@Module({
  imports: [ItemsModule, CategoriesModule, PhotosModule, DashboardModule],
})
export class InventoryModule {}
