$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# --- Port 3001 temizligi ---
Write-Host "[HoneyAI] Port 3001 kontrol ediliyor..." -ForegroundColor Cyan
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "[HoneyAI] Port 3001 dolu (PID $($conn.OwningProcess)), sonlandiriliyor..." -ForegroundColor Yellow
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}
# --- Backend ---
Write-Host "[HoneyAI] Backend baslatiliyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

# --- Expo (web modunda) ---
Write-Host "[HoneyAI] Expo (web) baslatiliyor..." -ForegroundColor Cyan
$expoCmd = "cd '$root'; npx expo start --web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $expoCmd -WindowStyle Normal

Write-Host ""
Write-Host "[HoneyAI] Hazir!" -ForegroundColor Green
Write-Host "  - Backend: http://localhost:3001" -ForegroundColor Gray
Write-Host "  - Web: Expo penceresinde acilacak (genelde http://localhost:8081)" -ForegroundColor Gray
