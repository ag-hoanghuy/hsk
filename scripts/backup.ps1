# Sao luu co so du lieu (tien do hoc, diem, bai lam) vao thu muc backups\.
# Chay: powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
#   -Keep 30              giu lai 30 ban moi nhat
#   -IfOlderThanHours 20  chi sao luu neu ban gan nhat cu hon 20 gio (start-web.bat dung tuy chon nay)
param(
    [int]$Keep = 30,
    [int]$IfOlderThanHours = 0
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
New-Item -ItemType Directory -Force backups | Out-Null

$latest = Get-ChildItem backups -Filter "hsk-*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($IfOlderThanHours -gt 0 -and $latest -and $latest.LastWriteTime -gt (Get-Date).AddHours(-$IfOlderThanHours)) {
    Write-Host "Ban sao luu gan nhat ($($latest.Name)) con moi, bo qua."
    exit 0
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$name = "hsk-$stamp.dump"
# pg_dump ghi file ben trong container roi copy ra, de khong bi PowerShell doi ma hoa noi dung.
docker compose exec -T db pg_dump -U hsk -d hsk -Fc -f "/tmp/$name"
if ($LASTEXITCODE -ne 0) { throw "pg_dump that bai (container db co dang chay khong?)" }
docker compose cp "db:/tmp/$name" "backups\$name"
docker compose exec -T db rm -f "/tmp/$name" | Out-Null
Write-Host "Da sao luu: backups\$name"

Get-ChildItem backups -Filter "hsk-*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -Skip $Keep | Remove-Item
