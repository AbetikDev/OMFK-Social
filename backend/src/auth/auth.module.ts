import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database/database.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [DatabaseModule, EncryptionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
