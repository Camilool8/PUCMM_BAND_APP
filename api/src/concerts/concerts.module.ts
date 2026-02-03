import { Module } from '@nestjs/common';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConcertsController],
  providers: [ConcertsService],
  exports: [ConcertsService],
})
export class ConcertsModule {}
