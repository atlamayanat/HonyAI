$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# --- Android SDK env vars ---
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:Path = "$sdk\platform-tools;$sdk\emulator;$env:Path"

$adb = "$sdk\platform-tools\adb.exe"
$emulatorExe = "$sdk\emulator\emulator.exe"
$avdName = "Medium_Phone_API_36.1"

# --- Port 3001 temizligi ---
Write-Host "[HoneyAI] Port 3001 kontrol ediliyor..." -ForegroundColor Cyan
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "[HoneyAI] Port 3001 dolu (PID $($conn.OwningProcess)), sonlandiriliyor..." -ForegroundColor Yellow
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# --- Emulator baslat (zaten acik degilse) ---
$running = & $adb devices 2>$null | Select-String "emulator-"
if (-not $running) {
    Write-Host "[HoneyAI] Android emulator baslatiliyor: $avdName" -ForegroundColor Cyan
    Start-Process $emulatorExe -ArgumentList "-avd", $avdName
} else {
    Write-Host "[HoneyAI] Emulator zaten calisiyor" -ForegroundColor Green
}

# --- Emulator'in tam boot olmasini bekle ---
Write-Host "[HoneyAI] Emulator boot olmasi bekleniyor (1-2 dk surebilir)..." -ForegroundColor Cyan
& $adb wait-for-device | Out-Null
$booted = $false
for ($i = 0; $i -lt 90; $i++) {
    $state = (& $adb shell getprop sys.boot_completed 2>$null).Trim()
    if ($state -eq "1") {
        $booted = $true
        break
    }
    Start-Sleep -Seconds 2
}
if ($booted) {
    Write-Host "[HoneyAI] Emulator hazir!" -ForegroundColor Green
} else {
    Write-Host "[HoneyAI] Emulator boot tamamlanamadi, yine de devam ediliyor..." -ForegroundColor Yellow
}

# --- Backend ---
Write-Host "[HoneyAI] Backend baslatiliyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

# --- Expo (QR gosterir, sonra 'a' tusuyla emulator'a yukler) ---
Write-Host "[HoneyAI] Expo baslatiliyor..." -ForegroundColor Cyan
$expoCmd = "`$env:ANDROID_HOME='$sdk'; `$env:ANDROID_SDK_ROOT='$sdk'; `$env:Path='$sdk\platform-tools;$sdk\emulator;' + `$env:Path; cd '$root'; npx expo start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $expoCmd -WindowStyle Normal

Write-Host ""
Write-Host "[HoneyAI] Hazir!" -ForegroundColor Green
Write-Host "  - QR kod: Expo penceresinde gorunecek (telefonda Expo Go ile tara)" -ForegroundColor Gray
Write-Host "  - Emulator'a yuklemek icin: Expo penceresinde 'a' tusuna bas" -ForegroundColor Gray
