import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlimentoModule } from './alimento/alimento.module';

@Module({
  imports: [AlimentoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
