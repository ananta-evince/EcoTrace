# Local PostgreSQL via Docker (requires Docker Desktop)
$ErrorActionPreference = 'Stop'

Write-Host 'Starting EcoTrace PostgreSQL...' -ForegroundColor Cyan
docker compose up -d

Write-Host 'Waiting for database...' -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  docker compose exec -T postgres pg_isready -U ecotrace -d ecotrace 2>$null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $ready) {
  Write-Error 'PostgreSQL did not become ready in time.'
}

$envContent = @"
DATABASE_URL="postgresql://ecotrace:ecotrace@localhost:5432/ecotrace"
DIRECT_URL="postgresql://ecotrace:ecotrace@localhost:5432/ecotrace"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ecotrace-dev-secret-key-32chars-min"
AUTH_SECRET="ecotrace-dev-secret-key-32chars-min"
GEMINI_API_KEY=""
"@

Set-Content -Path '.env' -Value $envContent -Encoding UTF8
Write-Host 'Wrote .env with local database credentials.' -ForegroundColor Green

Write-Host 'Running migrations...' -ForegroundColor Cyan
npx prisma migrate deploy
npm run db:seed

Write-Host 'Local database ready. Run: npm run dev' -ForegroundColor Green
