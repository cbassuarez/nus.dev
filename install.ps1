# Installs nus on Windows (x64) from GitHub Releases.
#
#   irm https://cbassuarez.com/nus.dev/install.ps1 | iex
#
# What it does, in order: picks the newest release that has a Windows package
# (stable if there is one, else preview), downloads it, checks it against the
# release's SHA256SUMS.txt, unpacks it under %LOCALAPPDATA%\Programs\nus, puts
# the `nus` command on your user PATH and adds a Start Menu shortcut. Nothing
# needs administrator rights; nothing is written outside those places.
#
#   $env:NUS_CHANNEL = 'preview'    take the preview channel even if a stable exists
#   $env:NUS_VERSION = 'v0.0.1'     install one exact tag
#   $env:NUS_PREFIX  = 'D:\apps'    where the app folder goes
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
  return ($sums -and ($sums -match "-$target\.zip"))
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
if (-not $tag) { throw "no published package for Windows yet. See https://cbassuarez.com/nus.dev/download/" }
if (-not (Has-Package $tag)) { throw "$tag has no package for $target." }
$version = $tag.TrimStart('v')
$name = "nus-$version-$target"
$file = "$name.zip"
$channel = if ($tag -like '*-preview.*') { 'preview' } else { 'stable' }
Write-Host "nus $tag ($channel) for $target"

# --- download and verify ------------------------------------------------------
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("nus-install-" + [Guid]::NewGuid().ToString('n').Substring(0, 8))
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  Write-Host "downloading $file"
  Invoke-WebRequest -UseBasicParsing "$dl/$tag/$file" -OutFile (Join-Path $tmp $file)
  $sums = Get-Sums $tag
  $want = (($sums -split "`n") | Where-Object { $_ -match "\s$([regex]::Escape($file))\s*$" } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
  $got = (Get-FileHash -Algorithm SHA256 (Join-Path $tmp $file)).Hash.ToLower()
  if ($want -ne $got) { throw "checksum mismatch for $file (expected $want, got $got)" }
  Write-Host 'checksum ok'

  # --- install ----------------------------------------------------------------
  $prefix = if ($env:NUS_PREFIX) { $env:NUS_PREFIX } else { Join-Path $env:LOCALAPPDATA 'Programs\nus' }
  $app = Join-Path $prefix 'app'
  $new = "$app.new"
  if (Test-Path $new) { Remove-Item -Recurse -Force $new }
  Expand-Archive -Path (Join-Path $tmp $file) -DestinationPath $tmp -Force
  # The archive holds one folder; keep its contents, not its versioned name.
  Move-Item (Join-Path $tmp $name) $new
  if (Test-Path $app) { Remove-Item -Recurse -Force $app }
  New-Item -ItemType Directory -Path $prefix -Force | Out-Null
  Move-Item $new $app
  if (-not (Test-Path (Join-Path $app 'nus.exe'))) { throw 'the archive did not contain nus.exe' }

  # The `nus` command: bin\nus.exe, on the user PATH.
  $binDir = Join-Path $app 'bin'
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  if (($userPath -split ';') -notcontains $binDir) {
    [Environment]::SetEnvironmentVariable('Path', (($userPath, $binDir) -join ';').Trim(';'), 'User')
    $env:Path = "$env:Path;$binDir"
    Write-Host "added $binDir to your PATH (new terminals see it)"
  }

  # A Start Menu shortcut to the app itself.
  $programs = [Environment]::GetFolderPath('Programs')
  $shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $programs 'nus.lnk'))
  $shortcut.TargetPath = Join-Path $app 'nus.exe'
  $shortcut.WorkingDirectory = $app
  $shortcut.Description = 'nus — a terminal that is also a browser'
  $shortcut.Save()

  Write-Host "installed $app"
  if ($channel -eq 'preview') {
    Write-Host 'this preview is unsigned: SmartScreen may ask once. More info, then Run anyway.'
  }
  Write-Host 'done. nus updates itself from GitHub Releases from here on; run this again any time.'
} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
