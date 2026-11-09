<#
.SYNOPSIS
Install a single skill from this repository into an agent's skills directory.

.EXAMPLE
.\scripts\install-skill.ps1 my-skill -Agent codex

.EXAMPLE
.\scripts\install-skill.ps1 my-skill -Agent claude -Project

.EXAMPLE
.\scripts\install-skill.ps1 my-skill -Dest C:\temp\skills -Lang zh -Force

.NOTES
-Agent <name> is required unless -Dest is given: there is no default agent.
-Lang picks en or zh, defaulting to en when that version exists and zh otherwise.
-Global (the default) installs into $<NAME>_HOME/skills, falling back to ~/.<name>/skills;
-Project installs into ./.<name>/skills. -Dest cannot be combined with -Global/-Project.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Skill,

  [string]$Agent,

  [switch]$Global,

  [switch]$Project,

  [string]$Dest,

  [ValidateSet('en', 'zh')]
  [string]$Lang,

  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$Repo = 'zn-craft/agent-skills'
$Ref = 'main'

function Show-AvailableSkills {
  param([string]$RepoRoot)

  $names = @()
  foreach ($root in @('skills', 'zh')) {
    $dir = Join-Path $RepoRoot $root
    if (-not (Test-Path -LiteralPath $dir)) { continue }
    $names += Get-ChildItem -Path $dir -Directory | Select-Object -ExpandProperty Name
  }
  foreach ($name in ($names | Sort-Object -Unique)) {
    $langs = @()
    foreach ($lang in @('en', 'zh')) {
      $sub = if ($lang -eq 'en') { 'skills' } else { 'zh' }
      if (Test-Path -LiteralPath (Join-Path $RepoRoot "$sub/$name/SKILL.md")) { $langs += $lang }
    }
    if ($langs.Count -eq 0) { continue }
    Write-Host "  - $name [$($langs -join ' ')]"
  }
}

# 英文版在 skills/<名>/，中文版在 zh/<名>/；没指定 -Lang 时优先英文版。
function Get-SkillLangSource {
  param([string]$RepoRoot, [string]$Name)

  $en = Join-Path $RepoRoot "skills/$Name"
  $zh = Join-Path $RepoRoot "zh/$Name"
  $order = if ($Lang) { @($Lang) } else { @('en', 'zh') }
  foreach ($lang in $order) {
    $candidate = if ($lang -eq 'en') { $en } else { $zh }
    if (Test-Path -LiteralPath (Join-Path $candidate 'SKILL.md')) { return $candidate }
  }
  return $null
}

if ($Skill -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
  throw "Invalid skill name: $Skill"
}

if ($Global -and $Project) {
  throw 'Use either -Global or -Project, not both.'
}
if ($Dest -and ($Global -or $Project)) {
  throw '-Dest cannot be combined with -Global/-Project.'
}
if (-not $Dest -and -not $Agent) {
  throw 'Specify the target: -Agent <name> (with -Global or -Project), or -Dest <dir>.'
}

if ($Agent) {
  $agentInput = $Agent
  $Agent = $Agent.ToLowerInvariant()
  if ($Agent -cnotmatch '^[a-z0-9][a-z0-9._-]*$' -or $Agent -like '*..*') {
    throw "Invalid agent name: $agentInput (use a name such as codex or claude)"
  }
}

if (-not $Dest) {
  if ($Project) {
    $Dest = Join-Path (Join-Path (Get-Location).Path ('.' + $Agent)) 'skills'
  }
  else {
    $agentEnv = (($Agent -replace '[.-]', '_')).ToUpperInvariant() + '_HOME'
    $agentBase = [System.Environment]::GetEnvironmentVariable($agentEnv)
    if (-not $agentBase) { $agentBase = Join-Path $HOME ('.' + $Agent) }
    $Dest = Join-Path $agentBase 'skills'
  }
}

Write-Host "Installing $Skill into $Dest"

$checkoutRoot = Split-Path -Parent $PSScriptRoot
$localSkillsRoot = Join-Path $checkoutRoot 'skills'
$tempRoot = $null

try {
  $localMatch = $null
  if (Test-Path -LiteralPath $localSkillsRoot) {
    $localMatch = Get-SkillLangSource -RepoRoot $checkoutRoot -Name $Skill
  }

  if ($localMatch) {
    $source = $localMatch
    Write-Host "Using local checkout: $($source.Substring($checkoutRoot.Length).TrimStart('\', '/') -replace '\\', '/')"
  }
  elseif (Test-Path -LiteralPath $localSkillsRoot) {
    Write-Warning "Skill '$Skill' not found in this checkout ($checkoutRoot)."
    Write-Host 'Available skills:'
    Show-AvailableSkills -RepoRoot $checkoutRoot
    throw "Skill not found: $Skill"
  }
  else {
    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("agent-skills-" + [System.Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
    $archive = Join-Path $tempRoot 'repo.zip'
    $url = "https://codeload.github.com/$Repo/zip/refs/heads/$Ref"
    Write-Host "Downloading $Repo@$Ref ..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    Expand-Archive -LiteralPath $archive -DestinationPath $tempRoot -Force

    $extracted = Get-ChildItem -Path $tempRoot -Directory | Select-Object -First 1
    $source = if ($extracted) { Get-SkillLangSource -RepoRoot $extracted.FullName -Name $Skill } else { $null }

    if (-not $source) {
      Write-Warning "Skill '$Skill' not found in $Repo@$Ref."
      Write-Host 'Available skills:'
      if ($extracted) { Show-AvailableSkills -RepoRoot $extracted.FullName }
      throw "Skill not found: $Skill"
    }
  }

  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  $langUsed = Split-Path -Leaf (Split-Path -Parent $source)
  if ($langUsed -eq 'skills') { $langUsed = 'en' }
  $installName = if ($langUsed -eq 'zh') { "$Skill-zh" } else { $Skill }
  $target = Join-Path $Dest $installName
  if (Test-Path -LiteralPath $target) {
    if ($Force) {
      $backup = "$target.bak." + (Get-Date -Format 'yyyyMMddHHmmss')
      Move-Item -LiteralPath $target -Destination $backup
      Write-Host "Moved existing installation to $backup"
    }
    else {
      throw "Already installed: $target (re-run with -Force to replace it)"
    }
  }

  Copy-Item -LiteralPath $source -Destination $target -Recurse
  Write-Host "Installed $installName ($langUsed) -> $target"
}
finally {
  if ($tempRoot -and (Test-Path -LiteralPath $tempRoot)) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
