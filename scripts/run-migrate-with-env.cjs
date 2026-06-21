const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envFile = process.argv[2] ?? '.env.production.local';
const envPath = path.resolve(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  console.error(`Env file not found: ${envPath}`);
  process.exit(1);
}

for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^\s*([^#=]+)=(.*)$/);
  if (!match) continue;
  const key = match[1].trim();
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

require('./prepare-db-env.cjs');

console.log('Running prisma migrate deploy...');
execSync('npx prisma migrate deploy', { stdio: 'inherit' });

console.log('Seeding database...');
execSync('npm run db:seed', { stdio: 'inherit' });

console.log('Database ready.');
