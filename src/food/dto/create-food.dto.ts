import { FoodType } from '../food-type.enum';

export class CreateFoodDto {
  nome!: string;
  tipo!: FoodType;
  localizacao!: 'pantry' | 'fridge' | 'freezer';
  validade!: Date;
  quantidade!: number;
}