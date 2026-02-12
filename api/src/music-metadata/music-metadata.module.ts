import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MusicMetadataController } from './music-metadata.controller';
import { MusicMetadataService } from './music-metadata.service';
import { OdesliProvider } from './providers/odesli.provider';
import { SpotifyProvider } from './providers/spotify.provider';
import { ITunesProvider } from './providers/itunes.provider';
import { ReccoBeatsProvider } from './providers/reccobeats.provider';
import { GetSongBpmProvider } from './providers/getsongbpm.provider';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [MusicMetadataController],
  providers: [
    MusicMetadataService,
    OdesliProvider,
    SpotifyProvider,
    ITunesProvider,
    ReccoBeatsProvider,
    GetSongBpmProvider,
  ],
  exports: [MusicMetadataService],
})
export class MusicMetadataModule {}
