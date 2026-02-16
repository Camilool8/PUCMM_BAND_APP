import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFileInfo {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface CreateAssetDto {
  type: AssetType;
  url: string;
  name?: string;
  instrumentTag?: string;
  songId?: string;
  concertId?: string;
  rehearsalId?: string;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    // Ensure upload directories exist
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = ['images', 'scores', 'videos'];
    for (const dir of dirs) {
      const fullPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  getUploadDir(type: 'images' | 'scores' | 'videos'): string {
    return path.join(this.uploadDir, type);
  }

  processUploadedFile(
    file: Express.Multer.File,
    type: 'images' | 'scores' | 'videos',
  ): UploadedFileInfo {
    const relativePath = `/uploads/${type}/${file.filename}`;
    return {
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      url: relativePath,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async createAsset(data: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        type: data.type,
        url: data.url,
        name: data.name,
        instrumentTag: data.instrumentTag,
        songId: data.songId,
        concertId: data.concertId,
        rehearsalId: data.rehearsalId,
      },
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async deleteAsset(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (asset) {
      // Delete the physical file
      await this.deleteFile(asset.url);
      // Delete the database record
      return this.prisma.asset.delete({ where: { id } });
    }
    throw new BadRequestException('Asset not found');
  }

  async getAssetsBySong(songId: string) {
    return this.prisma.asset.findMany({
      where: { songId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssetsByConcert(concertId: string) {
    return this.prisma.asset.findMany({
      where: { concertId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssetsByRehearsal(rehearsalId: string) {
    return this.prisma.asset.findMany({
      where: { rehearsalId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
