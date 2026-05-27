import { AlimentoTipo } from '../alimento-tipo.enum';

export class CreateAlimentoDto {
  nome!: string;
  tipo!: AlimentoTipo;
  localizacao!: 'dispensa' | 'geladeira' | 'freezer';
  validade!: Date;
  quantidade!: number;
}