import { Module } from '@nestjs/common';
import { RepertoireSectionsController } from './repertoire-sections.controller';
import { RepertoireSectionsService } from './repertoire-sections.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RepertoireSectionsController],
  providers: [RepertoireSectionsService],
  exports: [RepertoireSectionsService],
})
export class RepertoireSectionsModule {}
