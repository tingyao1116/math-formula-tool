$ErrorActionPreference = "Stop"
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
chcp 65001 > $null
$env:PYTHONUTF8 = "1"
python .\scripts\sync_web_data.py
