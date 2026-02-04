import { Module } from '@nestjs/common';
import { PublicMetadataController } from './public-metadata.controller';
import { PublicMetadataService } from './public-metadata.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicMetadataController],
  providers: [PublicMetadataService],
})
export class PublicMetadataModule {}
