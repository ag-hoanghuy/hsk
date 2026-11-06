# Tao loi tat "Hoc tieng Trung" ngoai man hinh, tro toi start-web.bat.
# Chay: powershell -ExecutionPolicy Bypass -File scripts\create-shortcut.ps1
$root = Split-Path -Parent $PSScriptRoot
$desktop = [Environment]::GetFolderPath("Desktop")
$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut((Join-Path $desktop "Hoc tieng Trung.lnk"))
$link.TargetPath = Join-Path $root "start-web.bat"
$link.WorkingDirectory = $root
$link.IconLocation = "$env:SystemRoot\System32\shell32.dll,13"
$link.Description = "Mo web hoc tieng Trung HSK 3-4"
$link.Save()
Write-Host "Da tao loi tat tren Desktop: Hoc tieng Trung"
