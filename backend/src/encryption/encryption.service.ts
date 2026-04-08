import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keys: Buffer[] = [];

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    try {
      const keysDirectory = this.resolveKeysDirectory();
      for (let i = 1; i <= 5; i++) {
        const keyPath = path.join(keysDirectory, `key${i}.key`);
        const rawKey = fs.readFileSync(keyPath, 'utf8').trim();

        if (rawKey.length !== 256) {
          throw new Error(`Invalid key length in ${keyPath}`);
        }

        this.keys.push(crypto.createHash('sha256').update(rawKey).digest());
      }
    } catch {
      throw new InternalServerErrorException('Encryption keys are missing or invalid');
    }
  }

  private resolveKeysDirectory() {
    const directPath = path.join(process.cwd(), 'Secure_keys');
    if (fs.existsSync(directPath)) {
      return directPath;
    }

    const nestedPath = path.join(process.cwd(), 'backend', 'Secure_keys');
    if (fs.existsSync(nestedPath)) {
      return nestedPath;
    }

    return directPath;
  }

  encryptValue(value: string, keyIndex = 0): string {
    const key = this.keys[keyIndex];
    if (!key) {
      throw new InternalServerErrorException('Encryption key not found');
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decryptValue(payload: string, keyIndex = 0): string {
    const key = this.keys[keyIndex];
    if (!key) {
      throw new InternalServerErrorException('Encryption key not found');
    }

    const [ivHex, authTagHex, encryptedHex] = payload.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new InternalServerErrorException('Invalid encrypted value format');
    }

    const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  createToken(size = 48): string {
    return crypto.randomBytes(size).toString('hex');
  }
}
