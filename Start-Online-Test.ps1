[CmdletBinding()]
param(
    [ValidateRange(1,50)][int]$Matches=8,
    [ValidateRange(1,180)][int]$Minutes=90,
    [switch]$Check
)
$ErrorActionPreference='Stop'
Push-Location (Join-Path $PSScriptRoot 'bot-starter')
try {
    if($Check){ & npm.cmd run check; exit $LASTEXITCODE }
    if(-not (Test-Path -LiteralPath '.token-TaylorMason')){ throw 'Run Start-Bot.cmd once to enter your TaylorMason token privately, then use this launcher. Do not paste the token into chat.' }
    Remove-Item Env:BOT_TOKEN,Env:BOT_NONCE,Env:BOT_TRAIN,Env:BOT_TRAIN_RESUME,Env:BOT_TRAIN_PLAN,Env:TOURNAMENT_ID -ErrorAction SilentlyContinue
    $env:BOT_NAME='TaylorMason'
    $env:BOT_STRATEGY='taylor'
    $env:BOT_EVAL_MATCHES=[string]$Matches
    $env:BOT_EVAL_MINUTES=[string]$Minutes
    $env:STDB_HOST='https://maincloud.spacetimedb.com'
    $env:STDB_DB='scrabblebot'
    Write-Host "TaylorMason: offense-only premium-word policy; up to $Matches full matches, $Minutes minutes."
    & npm.cmd start
    exit $LASTEXITCODE
} finally { Pop-Location }
