import { Module } from '@nestjs/common';
import { RehearsalsController } from './rehearsals.controller';
import { RehearsalsService } from './rehearsals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RehearsalsController],
  providers: [RehearsalsService],
  exports: [RehearsalsService],
})
export class RehearsalsModule {}
