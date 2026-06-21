param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$DirectUrl
)

$ErrorActionPreference = 'Stop'

$env:DATABASE_URL = $DatabaseUrl
$env:DIRECT_URL = $DirectUrl

Write-Host 'Running migrations...' -ForegroundColor Cyan
npx prisma migrate deploy

Write-Host 'Seeding demo data...' -ForegroundColor Cyan
npm run db:seed

Write-Host 'Database ready.' -ForegroundColor Green
Write-Host 'Demo login: demo@ecotrace.app / SecurePass123!'
