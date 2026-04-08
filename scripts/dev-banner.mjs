import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^"+|"+$/g, '');
      acc[key] = value;
      return acc;
    }, {});
};

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const network of Object.values(interfaces)) {
    for (const details of network ?? []) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }

  return 'localhost';
};

const root = process.cwd();
const backendEnv = readEnvFile(path.join(root, 'backend', '.env'));
const frontendEnv = readEnvFile(path.join(root, 'frontend', '.env'));
const backendPort = backendEnv.PORT || '3000';
const frontendUrl = backendEnv.FRONTEND_URL || 'http://localhost:5173';
const apiUrl = frontendEnv.VITE_API_URL || `http://localhost:${backendPort}`;
const localIp = getLocalIpAddress();
let frontendPort = '5173';

try {
  frontendPort = new URL(frontendUrl).port || '5173';
} catch {
  frontendPort = '5173';
}

console.log('');
console.log('OMFK Social dev server');
console.log(`API Local:    ${apiUrl}`);
console.log(`API Network:  http://${localIp}:${backendPort}`);
console.log(`Site Local:   ${frontendUrl}`);
console.log(`Site Network: http://${localIp}:${frontendPort}`);
console.log('');