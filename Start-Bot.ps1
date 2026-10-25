[CmdletBinding()]
param(
    [ValidatePattern('^[A-Za-z0-9_-]{1,32}$')]
    [string]$BotName = 'TaylorMason',
    [ValidateSet('taylor', 'defensive', 'wags', 'victor')]
    [string]$Strategy = 'taylor',
    [ValidatePattern('^[0-9]+$')]
    [string]$TournamentId,
    [switch]$Check,
    [switch]$Train,
    [ValidateRange(1, 50)]
    [int]$Matches = 8,
    [ValidatePattern('^[A-Za-z0-9_-]+$')]
    [string]$ResumeSession
)

$ErrorActionPreference = 'Stop'
if ($Strategy -notin @('taylor','defensive') -and $Train) { throw 'Bounded practice is only available for TaylorMason.' }
if ($Strategy -eq 'victor' -and $BotName -ne 'VictorMateo') { throw 'Use Start-VictorMateo.cmd for the VictorMateo hybrid strategy.' }
Push-Location (Join-Path $PSScriptRoot 'bot-starter')
try {
    if (-not (Test-Path -LiteralPath 'node_modules\tsx') -or
        -not (Test-Path -LiteralPath 'src\module_bindings\index.ts')) {
        throw 'Setup is incomplete. Install dependencies and generate the bot bindings first.'
    }
    if ($Check) {
        & npm.cmd run check
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        if ($Strategy -eq 'wags') { & npm.cmd run wags:check }
        elseif ($Strategy -eq 'victor') { & npm.cmd run victor:check }
        else { & npm.cmd run smoke }
        exit $LASTEXITCODE
    }

    $env:BOT_NAME = $BotName
    $env:BOT_STRATEGY = $Strategy
    if ($Strategy -in @('wags','victor')) {
        # Use this bot's saved token or a new hidden prompt, never an inherited token.
        Remove-Item Env:BOT_TOKEN,Env:BOT_NONCE,Env:BOT_TRAIN -ErrorAction SilentlyContinue
    }
    if ($Strategy -eq 'victor' -and -not $TournamentId) {
        Remove-Item Env:TOURNAMENT_ID -ErrorAction SilentlyContinue
    }
    if ($TournamentId) { $env:TOURNAMENT_ID = $TournamentId }
    $tokenPath = Join-Path (Get-Location) ".token-$BotName"
    if (-not $env:BOT_TOKEN -and -not $env:BOT_NONCE -and
        -not (Test-Path -LiteralPath $tokenPath)) {
        Write-Host 'Create your team on the game website, then choose Generate token.'
        Write-Host 'https://launchpad-scrabblebot.vercel.app/account'
        Write-Host 'If your account is anonymous, run Link-Account.cmd first.'
        Write-Host 'Paste the token here. Input is hidden; do not paste it into chat.'
        $secureToken = Read-Host 'Bot token' -AsSecureString
        $credential = New-Object System.Net.NetworkCredential('', $secureToken)
        $env:BOT_TOKEN = $credential.Password.Trim()
        if (-not $env:BOT_TOKEN) { throw 'No token entered.' }
    }
    if ($Train) {
        Remove-Item Env:TOURNAMENT_ID -ErrorAction SilentlyContinue
        $env:BOT_TRAIN_MATCHES = [string]$Matches
        if ($ResumeSession) { $env:BOT_TRAIN_RESUME = $ResumeSession }
        else { Remove-Item Env:BOT_TRAIN_RESUME -ErrorAction SilentlyContinue }
        & npm.cmd run train
    } else {
        & npm.cmd start
    }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
