import 'dotenv/config';
import {
  PrismaPg,
} from '@prisma/adapter-pg';
import {
  CategoryScope,
  PrismaClient,
} from '../src/generated/prisma/client.js';

const adapter =
  new PrismaPg({
    connectionString:
      process.env.DATABASE_URL!,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

const systemCategories = [
  {
    systemCode: 'FRUIT',
    name: 'Frutas',
    normalizedName: 'frutas',
    icon: 'apple',
    sortOrder: 10,
  },
  {
    systemCode: 'VEGETABLE',
    name: 'Vegetais',
    normalizedName: 'vegetais',
    icon: 'carrot',
    sortOrder: 20,
  },
  {
    systemCode: 'MEAT',
    name: 'Carnes',
    normalizedName: 'carnes',
    icon: 'beef',
    sortOrder: 30,
  },
  {
    systemCode: 'DAIRY',
    name: 'Laticínios',
    normalizedName: 'laticinios',
    icon: 'milk',
    sortOrder: 40,
  },
  {
    systemCode: 'BEVERAGE',
    name: 'Bebidas',
    normalizedName: 'bebidas',
    icon: 'cup-soda',
    sortOrder: 50,
  },
  {
    systemCode: 'BAKERY',
    name: 'Padaria',
    normalizedName: 'padaria',
    icon: 'croissant',
    sortOrder: 60,
  },
  {
    systemCode: 'OTHER',
    name: 'Outros',
    normalizedName: 'outros',
    icon: 'package',
    sortOrder: 999,
  },
];

async function main() {
  for (
    const category of
    systemCategories
  ) {
    await prisma
      .inventoryCategory
      .upsert({
        where: {
          systemCode:
            category.systemCode,
        },

        update: {
          name:
            category.name,

          normalizedName:
            category.normalizedName,

          icon:
            category.icon,

          sortOrder:
            category.sortOrder,

          isActive:
            true,
        },

        create: {
          ...category,

          ownerUserId:
            null,

          scope:
            CategoryScope.SYSTEM,

          isActive:
            true,
        },
      });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });