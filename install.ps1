# Installs nus on Windows (x64) from GitHub Releases.
#
#   irm https://cbassuarez.com/nus.dev/install.ps1 | iex
#
# What it does, in order: picks the newest release that has a Windows installer
# (stable if there is one, else preview), downloads it, checks it against the
# release's SHA256SUMS.txt, and runs it silently: nus installs for your user
# under %LOCALAPPDATA%\Programs\nus\<channel>, with a Start Menu entry and the
# `nus` command on your user PATH. It is the same installer the download page
# offers, so updates arrive inside the app and Settings › Apps uninstalls it.
# Nothing needs administrator rights.
#
#   $env:NUS_CHANNEL = 'preview'    take the preview channel even if a stable exists
#   $env:NUS_VERSION = 'v0.0.1'     install one exact tag
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = 'cbassuarez/nus'
$api = "https://api.github.com/repos/$repo/releases"
$dl = "https://github.com/$repo/releases/download"
$target = 'windows-x86_64'

if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64' -and $env:PROCESSOR_ARCHITEW6432 -ne 'AMD64') {
  throw "nus builds for 64-bit Intel/AMD Windows (this is $env:PROCESSOR_ARCHITECTURE)."
}

function Get-Sums($tag) {
  try { (Invoke-WebRequest -UseBasicParsing "$dl/$tag/SHA256SUMS.txt").Content } catch { $null }
}
function Has-Package($tag) {
  $sums = Get-Sums $tag
  return ($sums -and ($sums -match "-$target-setup\.exe"))
}

# --- which release ------------------------------------------------------------
$headers = @{ Accept = 'application/vnd.github+json'; 'User-Agent' = 'nus-install' }
$tag = $env:NUS_VERSION
if (-not $tag) {
  if ($env:NUS_CHANNEL -ne 'preview') {
    try { $stable = (Invoke-RestMethod -Headers $headers "$api/latest").tag_name } catch { $stable = $null }
    if ($stable -and (Has-Package $stable)) { $tag = $stable }
  }
  if (-not $tag) {
    $list = Invoke-RestMethod -Headers $headers "$api?per_page=30"
    foreach ($r in $list) {
      if ($r.prerelease -and -not $r.draft -and (Has-Package $r.tag_name)) { $tag = $r.tag_name; break }
    }
  }
}
if (-not $tag) { throw "no published installer for Windows yet. See https://cbassuarez.com/nus.dev/download/" }
if (-not (Has-Package $tag)) { throw "$tag has no installer for $target." }
$version = $tag.TrimStart('v')
$file = "nus-$version-$target-setup.exe"
$channel = if ($tag -like '*-preview.*') { 'preview' } else { 'release' }
Write-Host "nus $tag ($channel) for $target"

# --- download and verify ------------------------------------------------------
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("nus-install-" + [Guid]::NewGuid().ToString('n').Substring(0, 8))
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  $setup = Join-Path $tmp $file
  Write-Host "downloading $file"
  Invoke-WebRequest -UseBasicParsing "$dl/$tag/$file" -OutFile $setup
  $sums = Get-Sums $tag
  $want = (($sums -split "`n") | Where-Object { $_ -match "\s$([regex]::Escape($file))\s*$" } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
  $got = (Get-FileHash -Algorithm SHA256 $setup).Hash.ToLower()
  if (-not $want -or $want -ne $got) { throw "checksum mismatch for $file (expected $want, got $got)" }
  Write-Host 'checksum ok'

  # --- install ----------------------------------------------------------------
  Write-Host 'installing'
  $log = Join-Path $tmp 'install.log'
  $p = Start-Process $setup -ArgumentList '/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART', '/TASKS=path', "/LOG=$log" -Wait -PassThru
  if ($p.ExitCode -ne 0) { Get-Content $log -Tail 20; throw "the installer exited with $($p.ExitCode)" }

  # The installer added bin to the user PATH; this session sees it too.
  $app = Join-Path $env:LOCALAPPDATA "Programs\nus\$channel"
  if (($env:Path -split ';') -notcontains "$app\bin") { $env:Path = "$env:Path;$app\bin" }
  Write-Host "installed $app"
  Write-Host 'done. Run nus, or open it from the Start Menu. It updates itself from GitHub Releases.'
} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
