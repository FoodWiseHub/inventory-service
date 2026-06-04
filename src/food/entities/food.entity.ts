import { FoodType } from '../food-type.enum';

export class Food {
  id!: number;
  name!: string;
  type!: FoodType;
  location!: 'pantry' | 'fridge' | 'freezer';
  expirationDate!: Date;
  quantity!: number;
}