param(
  [string]$Message = "Update WWWD site"
)

$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

git add .

$pending = git status --porcelain
if (-not $pending) {
  Write-Output "NO_CHANGES"
  exit 0
}

git commit -m $Message
git push origin main

Write-Output "PUBLISHED"
