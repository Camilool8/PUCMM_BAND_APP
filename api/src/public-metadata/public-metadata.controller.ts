import { Controller, Get, Param } from '@nestjs/common';
import { PublicMetadataService } from './public-metadata.service';

@Controller('public/metadata')
export class PublicMetadataController {
  constructor(private readonly metadataService: PublicMetadataService) {}

  @Get('concert/:id')
  getConcertMetadata(@Param('id') id: string) {
    return this.metadataService.getConcertMetadata(id);
  }

  @Get('event/:id')
  getEventMetadata(@Param('id') id: string) {
    return this.metadataService.getEventMetadata(id);
  }

  @Get('song/:id')
  getSongMetadata(@Param('id') id: string) {
    return this.metadataService.getSongMetadata(id);
  }
}
