import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { AzureAdGuard } from '../auth/azure-ad.guard';

@Controller('songs')
@UseGuards(AzureAdGuard)
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  create(@Request() req, @Body() createSongDto: CreateSongDto) {
    const userId = req.user?.dbUser?.id;
    return this.songsService.create(createSongDto, userId);
  }

  @Get()
  findAll() {
    return this.songsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }
}
