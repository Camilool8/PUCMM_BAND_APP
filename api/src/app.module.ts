import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SongsModule } from './songs/songs.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';
import { RepertoireSectionsModule } from './repertoire-sections/repertoire-sections.module';
import { EventsModule } from './events/events.module';
import { ConcertsModule } from './concerts/concerts.module';
import { MusicMetadataModule } from './music-metadata/music-metadata.module';
import { PublicMetadataModule } from './public-metadata/public-metadata.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { LocationsModule } from './locations/locations.module';
import { RehearsalsModule } from './rehearsals/rehearsals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SongsModule,
    AuthModule,
    UsersModule,
    UploadsModule,
    RepertoireSectionsModule,
    EventsModule,
    ConcertsModule,
    RehearsalsModule,
    LocationsModule,
    MusicMetadataModule,
    PublicMetadataModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
