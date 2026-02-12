import { Module } from '@nestjs/common';
import { RepertoireSectionsController } from './repertoire-sections.controller';
import { RepertoireSectionsService } from './repertoire-sections.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RepertoireSectionsController],
  providers: [RepertoireSectionsService],
  exports: [RepertoireSectionsService],
})
export class RepertoireSectionsModule {}
