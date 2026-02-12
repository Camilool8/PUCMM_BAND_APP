import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
        {
          provide: PrismaService,
          useValue: { user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() } },
        },
        {
          provide: OrganizationsService,
          useValue: {
            getAllowedDomains: jest.fn().mockReturnValue(['ce.pucmm.edu.do']),
            getSuperadminEmail: jest.fn().mockReturnValue('admin@ce.pucmm.edu.do'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
