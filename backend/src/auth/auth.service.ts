import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { EncryptionService } from '../encryption/encryption.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly encryption: EncryptionService,
  ) {}

  async register(payload: RegisterDto, req: Request) {
    const username = payload.username.trim();
    const mail = payload.mail.trim().toLowerCase();

    const existingUser = this.database.get<{ id: string }>(
      'SELECT id FROM users WHERE username = ? OR mail = ? LIMIT 1',
      username,
      mail,
    );

    if (existingUser) {
      throw new ConflictException('Username or email already in use');
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const userid = randomUUID();
    const password_hashed = await this.encryption.hashPassword(payload.password);
    const encryptedMail = this.encryption.encryptValue(mail, 1);

    this.database.run(
      `INSERT INTO users (id, userid, username, mail, password_hashed, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      userid,
      username,
      mail,
      password_hashed,
      now,
      now,
    );
    this.database.run(
      `INSERT INTO user_profiles (id, userId, displayName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      randomUUID(),
      id,
      username,
      now,
      now,
    );
    this.database.run(
      `INSERT INTO audit_logs (id, userId, action, message, metadata, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      id,
      'REGISTER',
      'User registered',
      JSON.stringify({
        encryptedMail,
        ipAddress: this.getIpAddress(req),
      }),
      now,
    );

    return {
      message: 'User created successfully',
      user: this.sanitizeUser(this.getUserById(id)),
    };
  }

  async login(payload: LoginDto, req: Request) {
    const login = payload.login.trim();
    const normalizedLogin = login.toLowerCase();
    const user = this.database.get<UserRecord>(
      `SELECT id, userid, username, mail, password_hashed, lastlogin, isActive, role, createdAt, updatedAt
       FROM users
       WHERE username = ? OR mail = ?
       LIMIT 1`,
      login,
      normalizedLogin,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await this.encryption.comparePassword(
      payload.password,
      user.password_hashed,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date();
    const accessToken = this.encryption.createToken();
    const refreshToken = this.encryption.encryptValue(accessToken, 3);
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nowIso = now.toISOString();

    this.database.run(
      'UPDATE users SET lastlogin = ?, updatedAt = ? WHERE id = ?',
      nowIso,
      nowIso,
      user.id,
    );
    this.database.run(
      `INSERT INTO sessions (id, userId, refreshToken, userAgent, ipAddress, expiresAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      user.id,
      refreshToken,
      req.headers['user-agent'] ?? null,
      this.getIpAddress(req),
      expiresAt.toISOString(),
      nowIso,
    );
    this.database.run(
      `INSERT INTO audit_logs (id, userId, action, message, metadata, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      user.id,
      'LOGIN',
      'User logged in',
      JSON.stringify({
        ipAddress: this.getIpAddress(req),
      }),
      nowIso,
    );

    return {
      message: 'Login successful',
      accessToken,
      user: this.sanitizeUser(this.getUserById(user.id)),
    };
  }

  private getUserById(id: string) {
    const user = this.database.get<UserRecord>(
      `SELECT id, userid, username, mail, password_hashed, lastlogin, isActive, role, createdAt, updatedAt
       FROM users
       WHERE id = ?
       LIMIT 1`,
      id,
    );
    const profile = this.database.get<UserProfileRecord>(
      `SELECT id, displayName, bio, avatarUrl, createdAt, updatedAt
       FROM user_profiles
       WHERE userId = ?
       LIMIT 1`,
      id,
    );

    return {
      ...user,
      profile: profile ?? null,
    };
  }

  private sanitizeUser<T extends { password_hashed?: string }>(user: T) {
    const { password_hashed, ...safeUser } = user;
    return safeUser;
  }

  private getIpAddress(req: Request) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    return req.ip ?? null;
  }
}

type UserRecord = {
  id: string;
  userid: string;
  username: string;
  mail: string;
  password_hashed: string;
  lastlogin: string | null;
  isActive: number;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type UserProfileRecord = {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
