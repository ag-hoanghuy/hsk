# Khoi phuc co so du lieu tu mot ban sao luu (thay the TOAN BO du lieu hien tai).
# Chay: powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 backups\hsk-20261106-120000.dump
param([Parameter(Mandatory = $true)][string]$File)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if (-not (Test-Path $File)) { throw "Khong tim thay file $File" }

$answer = Read-Host "Du lieu hien tai se bi thay bang $File. Go 'co' de tiep tuc"
if ($answer -ne "co") { Write-Host "Da huy."; exit 1 }

# Sao luu ban hien tai truoc, phong khi can quay lai.
& "$PSScriptRoot\backup.ps1"

docker compose cp $File "db:/tmp/restore.dump"
docker compose exec -T db pg_restore -U hsk -d hsk --clean --if-exists --no-owner "/tmp/restore.dump"
docker compose exec -T db rm -f /tmp/restore.dump | Out-Null
docker compose restart backend | Out-Null
Write-Host "Da khoi phuc tu $File."
