param(
  [string]$VenvPath = ".venv-word",
  [string]$RequirementsPath = "requirements-word-pipeline.txt",
  [switch]$UseUserInstall = $true
)

$ErrorActionPreference = "Stop"

function Resolve-PathSafe([string]$PathValue) {
  if ([System.IO.Path]::IsPathRooted($PathValue)) { return $PathValue }
  return Join-Path (Get-Location) $PathValue
}

$reqFull = Resolve-PathSafe $RequirementsPath

if (-not (Test-Path $reqFull)) {
  throw "Requirements file not found: $reqFull"
}

if ($UseUserInstall) {
  Write-Host "Installing to user site-packages..."
  python -m pip install --upgrade pip
  python -m pip install --user -r $reqFull
  Write-Host ""
  Write-Host "Done."
  Write-Host "Run this to verify:"
  Write-Host "  python scripts/check_word_pipeline_tools.py --json"
  exit 0
}

$venvFull = Resolve-PathSafe $VenvPath
if (-not (Test-Path $venvFull)) {
  Write-Host "Creating virtual env: $venvFull"
  python -m venv $venvFull
}

$pythonExe = Join-Path $venvFull "Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
  throw "Python executable not found in venv: $pythonExe"
}

Write-Host "Upgrading pip in venv..."
& $pythonExe -m pip install --upgrade pip

Write-Host "Installing Word pipeline packages into venv..."
& $pythonExe -m pip install -r $reqFull

Write-Host ""
Write-Host "Done."
Write-Host "Run this to verify:"
Write-Host "  $pythonExe scripts/check_word_pipeline_tools.py --json"
