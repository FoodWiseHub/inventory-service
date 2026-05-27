export class Alimento {
  id!: number;
  nome!: string;
  tipo!: string;
  localizacao!: 'dispensa' | 'geladeira' | 'freezer';
  validade!: Date;
}