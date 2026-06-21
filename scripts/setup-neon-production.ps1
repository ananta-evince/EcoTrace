$ErrorActionPreference = 'Stop'

Write-Host '=== EcoTrace Neon production setup ===' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Prerequisite: Accept Neon terms at:' -ForegroundColor Yellow
Write-Host 'https://vercel.com/ananta2/~/integrations/accept-terms/neon?source=cli' -ForegroundColor White
Write-Host ''
$continue = Read-Host 'Have you accepted the terms? (y/n)'
if ($continue -ne 'y') {
  Write-Host 'Accept terms first, then run this script again.' -ForegroundColor Red
  exit 1
}

Write-Host 'Creating Neon database on Vercel...' -ForegroundColor Cyan
npx vercel integration add neon `
  --name ecotrace-db `
  -m auth=false `
  -m region=iad1 `
  --plan free_v3 `
  -e production `
  -e preview

Write-Host 'Pulling production env vars...' -ForegroundColor Cyan
npx vercel env pull .env.production.local --environment=production

Write-Host 'Loading env for Prisma...' -ForegroundColor Cyan
Get-Content .env.production.local | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"')
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
}
node scripts/prepare-db-env.cjs

Write-Host 'Running migrations...' -ForegroundColor Cyan
npx prisma migrate deploy

Write-Host 'Seeding demo data...' -ForegroundColor Cyan
npm run db:seed

Write-Host 'Deploying to Vercel...' -ForegroundColor Cyan
npx vercel --prod

Write-Host ''
Write-Host 'Done! Visit https://ecotrace.vercel.app' -ForegroundColor Green
Write-Host 'Demo: demo@ecotrace.app / SecurePass123!' -ForegroundColor Green
