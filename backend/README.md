# OMFK Backend

Backend is built with `NestJS` and local SQLite storage through `node:sqlite`.

## Setup

```bash
npm install
copy .env.example .env
npm run start:dev
```

## Environment

All backend configuration is loaded from `.env`.

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:C:/OMFK-Social-data/dev.db"
```

## Database

Tables are created automatically on backend startup.

- `users`
- `user_profiles`
- `sessions`
- `audit_logs`
- `posts`
- `comments`
- `likes`

## Encryption keys

Keys are stored in `backend/Secure_keys`.
Each file contains a random 256-character key and is used by `EncryptionService` for AES-256-GCM encryption.

## Note for Windows

The SQLite file is stored in `C:/OMFK-Social-data/dev.db` to avoid issues with Cyrillic paths inside OneDrive folders.
