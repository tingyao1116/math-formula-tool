$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $root ("backups\" + $timestamp)

$items = @(
  "data\formula-content.js",
  "formula-data.js",
  "chapter-overviews.js",
  "docs\project-rules.md",
  "docs\recovery-and-backup.md"
)

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

foreach ($item in $items) {
  $src = Join-Path $root $item
  if (Test-Path $src) {
    $dest = Join-Path $backupDir $item
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Copy-Item -LiteralPath $src -Destination $dest -Force
  }
}

Write-Output "Backup created: $backupDir"
