import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private database!: DatabaseSync;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL', 'file:C:/OMFK-Social-data/dev.db');
    const databasePath = this.resolveSqlitePath(databaseUrl);

    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec('PRAGMA foreign_keys = ON;');
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        userid TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        mail TEXT NOT NULL UNIQUE,
        password_hashed TEXT NOT NULL,
        lastlogin TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        role TEXT NOT NULL DEFAULT 'USER',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL UNIQUE,
        displayName TEXT,
        bio TEXT,
        avatarUrl TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        refreshToken TEXT NOT NULL UNIQUE,
        userAgent TEXT,
        ipAddress TEXT,
        expiresAt TEXT NOT NULL,
        revokedAt TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        action TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        authorId TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        authorId TEXT NOT NULL,
        postId INTEGER NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        postId INTEGER NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, postId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
  }

  get<T>(query: string, ...params: SQLInputValue[]) {
    return this.database.prepare(query).get(...params) as T | undefined;
  }

  all<T>(query: string, ...params: SQLInputValue[]) {
    return this.database.prepare(query).all(...params) as T[];
  }

  run(query: string, ...params: SQLInputValue[]) {
    return this.database.prepare(query).run(...params);
  }

  private resolveSqlitePath(databaseUrl: string) {
    const normalized = databaseUrl.replace(/^"+|"+$/g, '');
    if (!normalized.startsWith('file:')) {
      return path.resolve(normalized);
    }

    const filePath = normalized.slice(5);
    if (/^[A-Za-z]:\//.test(filePath)) {
      return filePath;
    }

    return path.resolve(process.cwd(), filePath);
  }
}
