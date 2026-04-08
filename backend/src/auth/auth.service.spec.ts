import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { EncryptionService } from '../encryption/encryption.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            get: jest.fn(),
            run: jest.fn(),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
            encryptValue: jest.fn(),
            createToken: jest.fn(),
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
