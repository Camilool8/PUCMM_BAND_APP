import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadsService } from './uploads.service';
import { AzureAdGuard } from '../auth/azure-ad.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssetType, Role } from '@prisma/client';

// File size limits (in bytes)
const FILE_LIMITS = {
  image: 15 * 1024 * 1024,      // 15 MB
  pdf: 150 * 1024 * 1024,       // 150 MB
  video: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
};

// MIME type mappings by extension
const IMAGE_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const VIDEO_MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
};

const PDF_MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
};

// Generate unique filename
const generateFilename = (file: Express.Multer.File): string => {
  const uniqueId = uuidv4();
  const ext = extname(file.originalname).toLowerCase();
  return `${uniqueId}${ext}`;
};

// Create storage configuration for a specific type
const createStorage = (folder: string) =>
  diskStorage({
    destination: `./uploads/${folder}`,
    filename: (req, file, callback) => {
      callback(null, generateFilename(file));
    },
  });

// File filter for images - validates and fixes mimetype
const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  const expectedMime = IMAGE_MIME_TYPES[ext];

  if (!expectedMime) {
    return callback(
      new BadRequestException(`Invalid image format. Allowed: ${Object.keys(IMAGE_MIME_TYPES).join(', ')}`),
      false,
    );
  }

  // Fix mimetype if multer detected it incorrectly
  if (file.mimetype === 'application/octet-stream') {
    file.mimetype = expectedMime;
  }

  callback(null, true);
};

// File filter for videos
const videoFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  const expectedMime = VIDEO_MIME_TYPES[ext];

  if (!expectedMime) {
    return callback(
      new BadRequestException(`Invalid video format. Allowed: ${Object.keys(VIDEO_MIME_TYPES).join(', ')}`),
      false,
    );
  }

  // Fix mimetype if multer detected it incorrectly
  if (file.mimetype === 'application/octet-stream') {
    file.mimetype = expectedMime;
  }

  callback(null, true);
};

// File filter for PDFs
const pdfFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  const expectedMime = PDF_MIME_TYPES[ext];

  if (!expectedMime) {
    return callback(
      new BadRequestException(`Invalid PDF format. Allowed: ${Object.keys(PDF_MIME_TYPES).join(', ')}`),
      false,
    );
  }

  // Fix mimetype if multer detected it incorrectly
  if (file.mimetype === 'application/octet-stream') {
    file.mimetype = expectedMime;
  }

  callback(null, true);
};

@Controller('uploads')
@UseGuards(AzureAdGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // ============================================================================
  // Image Upload (covers, banners, etc.) - Members and admin only
  // ============================================================================
  @Post('image')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  @UseInterceptors(FileInterceptor('file', { storage: createStorage('images'), fileFilter: imageFileFilter }))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FILE_LIMITS.image }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileInfo = this.uploadsService.processUploadedFile(file, 'images');
    return {
      success: true,
      file: fileInfo,
    };
  }

  // ============================================================================
  // PDF Upload (scores, sheet music) - Members and admin only
  // ============================================================================
  @Post('pdf')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  @UseInterceptors(FileInterceptor('file', { storage: createStorage('scores'), fileFilter: pdfFileFilter }))
  async uploadPdf(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FILE_LIMITS.pdf }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileInfo = this.uploadsService.processUploadedFile(file, 'scores');
    return {
      success: true,
      file: fileInfo,
    };
  }

  // ============================================================================
  // Video Upload (concert recordings, practice videos) - Members and admin only
  // ============================================================================
  @Post('video')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('videos'),
      limits: { fileSize: FILE_LIMITS.video },
      fileFilter: videoFileFilter,
    }),
  )
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FILE_LIMITS.video }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileInfo = this.uploadsService.processUploadedFile(file, 'videos');
    return {
      success: true,
      file: fileInfo,
    };
  }

  // ============================================================================
  // Create Asset (link uploaded file to a song or concert) - Members and admin only
  // ============================================================================
  @Post('asset')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.MEMBER)
  async createAsset(
    @Body()
    body: {
      type: AssetType;
      url: string;
      name?: string;
      instrumentTag?: string;
      songId?: string;
      concertId?: string;
      rehearsalId?: string;
    },
  ) {
    if (!body.songId && !body.concertId && !body.rehearsalId) {
      throw new BadRequestException('Either songId, concertId, or rehearsalId must be provided');
    }

    const asset = await this.uploadsService.createAsset({
      type: body.type,
      url: body.url,
      name: body.name,
      instrumentTag: body.instrumentTag,
      songId: body.songId,
      concertId: body.concertId,
      rehearsalId: body.rehearsalId,
    });

    return {
      success: true,
      asset,
    };
  }

  // ============================================================================
  // Get Assets by Song
  // ============================================================================
  @Get('song/:songId/assets')
  async getAssetsBySong(@Param('songId') songId: string) {
    return this.uploadsService.getAssetsBySong(songId);
  }

  // ============================================================================
  // Get Assets by Concert
  // ============================================================================
  @Get('concert/:concertId/assets')
  async getAssetsByConcert(@Param('concertId') concertId: string) {
    return this.uploadsService.getAssetsByConcert(concertId);
  }

  // ============================================================================
  // Get Assets by Rehearsal
  // ============================================================================
  @Get('rehearsal/:rehearsalId/assets')
  async getAssetsByRehearsal(@Param('rehearsalId') rehearsalId: string) {
    return this.uploadsService.getAssetsByRehearsal(rehearsalId);
  }

  // ============================================================================
  // Delete Asset (admin only)
  // ============================================================================
  @Delete('asset/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  async deleteAsset(@Param('id') id: string) {
    await this.uploadsService.deleteAsset(id);
    return { success: true };
  }
}
