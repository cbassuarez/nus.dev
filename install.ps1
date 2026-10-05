# Installs or updates nus on Windows (x64) from GitHub Releases.
#
#   irm https://cbassuarez.com/nus.dev/install.ps1 | iex
#
# It picks the newest release with a Windows installer (stable if there is one,
# else preview), checks it against the release's SHA256SUMS.txt, and runs it
# silently: nus installs for your user under %LOCALAPPDATA%\Programs\nus\<channel>,
# with a Start Menu entry and the `nus` command on your user PATH. It is the
# same installer the download page offers, so updates arrive inside the app and
# Settings > Apps uninstalls it. Run again, it updates the copy it finds, or
# says it is up to date. Nothing needs administrator rights.
#
#   $env:NUS_CHANNEL = 'preview'    take the preview channel even if a stable exists
#   $env:NUS_VERSION = 'v0.0.1'     install one exact tag
#   $env:NO_COLOR    = '1'          no colour; redirected output is plain anyway
#   $env:NUS_UNINSTALL = '1'        remove every copy instead (when `nus uninstall` cannot run)
$callerErrors = $ErrorActionPreference
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = 'cbassuarez/nus'
$api = "https://api.github.com/repos/$repo/releases"
$dl = "https://github.com/$repo/releases/download"
$target = 'windows-x86_64'

# --- how it looks --------------------------------------------------------------
# A console that understands escape codes gets colour, redrawn lines and the
# wordmark settling out of noise; redirected output gets one plain line per step.
# Box and braille glyphs only where the console can draw them (Windows Terminal,
# PowerShell 7).
$e = [char]27
$tty = -not [Console]::IsOutputRedirected -and $Host.UI.SupportsVirtualTerminal
$glyphs = $tty -and ($env:WT_SESSION -or $PSVersionTable.PSVersion.Major -ge 7)
if ($glyphs) { try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { $glyphs = $false } }
if ($tty -and -not $env:NO_COLOR) {
  $reset = "$e[0m"; $bold = "$e[1m"; $grey = "$e[90m"; $faint = "$e[2;90m"
  $red = if ($env:WT_SESSION -or $env:COLORTERM -match 'truecolor|24bit') { "$e[38;2;224;87;76m" } else { "$e[31m" }
} else { $reset = ''; $bold = ''; $grey = ''; $faint = ''; $red = '' }
if ($glyphs) {
  $ok = [string][char]0x2713; $bad = [string][char]0x2717; $dot = [string][char]0x00B7; $full = [string][char]0x25B0; $empty = [string][char]0x25B1
  $rule = [string][char]0x2500; $gutter = [string][char]0x2502; $arrow = [string][char]0x2192; $more = [string][char]0x2026
  $spin = 0x280B, 0x2819, 0x2839, 0x2838, 0x283C, 0x2834, 0x2826, 0x2827, 0x2807, 0x280F | ForEach-Object { [string][char]$_ }
  $noise = 0x2591, 0x2592, 0x2593 | ForEach-Object { [string][char]$_ }
  $noise += '#', '%', '&', '*', '+', '=', '-', ':'
} else {
  $ok = '+'; $bad = 'x'; $dot = '-'; $full = '#'; $empty = '-'; $rule = '-'; $gutter = '|'; $arrow = '->'; $more = '...'
  $spin = '|', '/', '-', '\'; $noise = '#', '%', '&', '*', '+', '=', '-', ':'
}
$cols = try { [Console]::WindowWidth } catch { 100 }
$okMark = "$red$bold$ok$reset"

function Now { [Diagnostics.Stopwatch]::GetTimestamp() / [Diagnostics.Stopwatch]::Frequency * 1000 }
function Took($since) { '{0:0.0}s' -f (((Now) - $since) / 1000) }
function Pad([string]$s, [int]$n) { if ($s.Length -ge $n) { $s } else { $s + (' ' * ($n - $s.Length)) } }
function Clear-Line { if ($tty) { [Console]::Write("`r$e[2K") } }

# One step of the manifest: number, name, detail, status, time.
function Row($n, $name, $detail, $mark, $time) {
  [Console]::WriteLine(('  {0}{1}{2}  {3}{4}{2}{5}{6}{2}  {7}{0}{8,7}{2}' -f $grey, $n, $reset, $bold, (Pad $name 10), $grey, (Pad $detail 52), $mark, $time))
}
function Fail([string]$why) {
  Clear-Line
  [Console]::WriteLine("  $red$bold$bad$reset $why")
  throw (New-Object Management.Automation.ErrorRecord (New-Object Exception $why), 'nus-install', 'NotSpecified', $null)
}

# --- the wordmark ----------------------------------------------------------------
$banner = '   _ __  _   _ ___ ', "  | '_ \| | | / __|", '  | | | | |_| \__ \', '  |_| |_|\__,_|___/'
function Banner($tag, $version) {
  if (-not $tty) {
    [Console]::WriteLine(''); [Console]::WriteLine("  $($banner[0])"); [Console]::WriteLine("  $($banner[1])   $tag")
    [Console]::WriteLine("  $($banner[2])   $version"); [Console]::WriteLine("  $($banner[3])"); [Console]::WriteLine(''); return
  }
  [Console]::Write("`n`n`n`n`n")
  # Each letter is noise until its moment, flashes red as it lands, then holds;
  # left to right, the way nus's split-flap board settles.
  for ($f = 0; $f -le 42; $f++) {
    $t = $f * 35
    $out = New-Object Text.StringBuilder
    [void]$out.Append("$e[4A")
    for ($k = 0; $k -lt 4; $k++) {
      [void]$out.Append("`r  ")
      $row = $banner[$k]
      for ($c = 0; $c -lt $row.Length; $c++) {
        $ch = $row[$c]; $at = 150 + ($c + 1) * 55 + ($k + 1) * 25
        if ($ch -eq ' ') { [void]$out.Append(' ') }
        elseif ($t -lt $at) { [void]$out.Append("$faint$($noise[($f + $k * 7 + $c * 13) % $noise.Count])$reset") }
        elseif ($t -lt $at + 160) { [void]$out.Append("$red$bold$ch$reset") }
        else { [void]$out.Append("$bold$ch$reset") }
      }
      if ($f -eq 42 -and $k -eq 1) { [void]$out.Append("   $bold$tag$reset") }
      if ($f -eq 42 -and $k -eq 2) { [void]$out.Append("   $grey$version$reset") }
      [void]$out.Append("$e[K`n")
    }
    [Console]::Write($out.ToString())
    if ($f -lt 42) { Start-Sleep -Milliseconds 35 }
  }
  [Console]::WriteLine('')
}

# --- downloads -------------------------------------------------------------------
# GitHub serves it as application/octet-stream, which Windows PowerShell 5.1
# hands back as bytes, not text.
function Get-Sums($tag) {
  try { $c = (Invoke-WebRequest -UseBasicParsing "$dl/$tag/SHA256SUMS.txt").Content } catch { return $null }
  if ($c -is [byte[]]) { [Text.Encoding]::UTF8.GetString($c) } else { $c }
}
function Has-Package($tag) {
  $sums = Get-Sums $tag
  return ($sums -and ($sums -match "-$target-setup\.exe"))
}

# Fetch the installer with a live bar, then check it against SHA256SUMS.txt.
function Fetch($url, $path, $sums) {
  $start = Now
  Add-Type -AssemblyName System.Net.Http
  $client = New-Object Net.Http.HttpClient
  $client.DefaultRequestHeaders.UserAgent.ParseAdd('nus-install')
  $response = $client.GetAsync($url, [Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
  if (-not $response.IsSuccessStatusCode) { Fail "the download failed ($([int]$response.StatusCode))" }
  $size = [long]($response.Content.Headers.ContentLength)
  $in = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
  $out = [IO.File]::Create($path)
  try {
    $buffer = New-Object byte[] 262144; $got = 0L; $i = 0; $drawn = 0
    while (($n = $in.Read($buffer, 0, $buffer.Length)) -gt 0) {
      $out.Write($buffer, 0, $n); $got += $n
      if ($tty -and ((Now) - $drawn) -ge 100) {
        $drawn = Now; $i++
        $pct = if ($size -gt 0) { [int]($got * 100 / $size) } else { 0 }
        $seg = [Math]::Min(20, [int]($pct / 5))
        Clear-Line
        [Console]::Write(('  {0}02{1}  {2}{3}{1}{4}{5}{1} {4}{6}{7}{8}{1}  {9,3}%  {0}{10} / {11} MB{1}' -f $grey, $reset, $bold, (Pad 'Download' 10), $red, $spin[$i % $spin.Count], ($full * $seg), $faint, ($empty * (20 - $seg)), $pct, [int]($got / 1MB), [int]($size / 1MB)))
      }
    }
  } finally { $out.Dispose(); $in.Dispose(); $client.Dispose() }
  Clear-Line
  $name = Split-Path $path -Leaf
  Row '02' 'Download' "$name $dot $([int]((Get-Item $path).Length / 1MB)) MB" $okMark (Took $start)
  $start = Now
  $want = (($sums -split "`n") | Where-Object { $_ -match "\s$([regex]::Escape($name))\s*$" } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
  $got = (Get-FileHash -Algorithm SHA256 $path).Hash.ToLower()
  if (-not $want -or $want -ne $got) { Fail "$name does not match the release's SHA256SUMS (expected $want, got $got)" }
  Row '03' 'Verify' "sha256 $($got.Substring(0, 8))$more$($got.Substring(57))" $okMark (Took $start)
}

# --- installing --------------------------------------------------------------------
# Run the installer with its log in a dimmed, indented window of its last four
# lines; on success the window folds into the step's line, on failure all of it
# stays, with the log's path.
function Stream($verb, $doing, $done, $setup, $arguments, $log) {
  $start = Now
  $p = Start-Process $setup -ArgumentList $arguments -PassThru
  $shown = 0; $i = 0
  while (-not $p.HasExited) {
    if ($tty) {
      if ($shown -gt 0) { [Console]::Write("$e[$($shown)A") }
      Clear-Line; Row '04' $verb $doing "$grey$($spin[$i % $spin.Count])$reset" (Took $start)
      $lines = @(if (Test-Path $log) { Get-Content $log -Tail 4 -ErrorAction SilentlyContinue })
      foreach ($l in $lines) {
        $l = if ($l.Length -gt $cols - 12) { $l.Substring(0, $cols - 12) } else { $l }
        [Console]::WriteLine("`r$e[2K      $faint$gutter $l$reset")
      }
      $shown = $lines.Count + 1
    }
    $i++; Start-Sleep -Milliseconds 100
  }
  if ($tty -and $shown -gt 0) { [Console]::Write("$e[$($shown)A$e[J") }
  if ($p.ExitCode -ne 0) {
    Row '04' $verb $doing "$red$bold$bad$reset" (Took $start)
    if (Test-Path $log) { Get-Content $log | ForEach-Object { [Console]::WriteLine("      $faint$gutter$reset $_") } }
    Fail "the installer exited with $($p.ExitCode); the full log is $log"
  }
  Row '04' $verb $done $okMark (Took $start)
}

function Finish($mode, $version) {
  [Console]::WriteLine("  $faint$($rule * 81)$reset")
  if ($mode -eq 'update') { [Console]::WriteLine("  Restart  $red${bold}nus$reset  ${grey}to use $version$reset") }
  elseif ($mode -eq 'current') { [Console]::WriteLine("  nus $version is up to date. Run  $red${bold}nus$reset") }
  else { [Console]::WriteLine("  Run  $red${bold}nus$reset") }
  [Console]::WriteLine('')
  [Console]::WriteLine("  $(Pad 'nus --help' 16)${grey}everything the command does$reset")
  [Console]::WriteLine("  $(Pad 'updates' 16)${grey}arrive inside nus$reset")
  [Console]::WriteLine('')
}

# Every copy for this user, by its own uninstaller; profiles stay. For when
# nus itself will not start: $env:NUS_UNINSTALL = '1'; irm .../install.ps1 | iex
function Uninstall {
  Banner "nus unified environment $dot uninstaller" 'every copy for this user'
  $n = 0
  foreach ($dir in 'preview', 'release') {
    $u = Get-ChildItem (Join-Path $env:LOCALAPPDATA "nus\uninstall\$dir") -Filter 'unins*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $u) { continue }
    $n++; $start = Now
    $p = Start-Process $u.FullName -ArgumentList '/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART' -Wait -PassThru
    if ($p.ExitCode -ne 0) { Fail "the $dir uninstaller exited with $($p.ExitCode)" }
    Row "0$n" 'Remove' "%LOCALAPPDATA%\Programs\nus\$dir" $okMark (Took $start)
  }
  if ($n -eq 0) { Row '01' 'Found' 'no installed copy of nus' $okMark ''; return }
  [Console]::WriteLine("  $faint$($rule * 81)$reset")
  [Console]::WriteLine("  nus is gone. Settings stay in %LOCALAPPDATA%\nus\installs")
  [Console]::WriteLine('')
}

function Main {
  if ($env:NUS_UNINSTALL) { Uninstall; return }
  if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64' -and $env:PROCESSOR_ARCHITEW6432 -ne 'AMD64') {
    Fail "nus builds for 64-bit Intel/AMD Windows (this is $env:PROCESSOR_ARCHITECTURE)."
  }
  $begun = Now

  # --- which release -------------------------------------------------------------
  $headers = @{ Accept = 'application/vnd.github+json'; 'User-Agent' = 'nus-install' }
  $tag = $env:NUS_VERSION
  if (-not $tag) {
    if ($env:NUS_CHANNEL -ne 'preview') {
      try { $stable = (Invoke-RestMethod -Headers $headers "$api/latest").tag_name } catch { $stable = $null }
      if ($stable -and (Has-Package $stable)) { $tag = $stable }
    }
    if (-not $tag) {
      # ${api}, not $api: PowerShell would read `$api?per_page` as one variable.
      $list = Invoke-RestMethod -Headers $headers "${api}?per_page=30"
      foreach ($r in $list) {
        if ($r.prerelease -and -not $r.draft -and (Has-Package $r.tag_name)) { $tag = $r.tag_name; break }
      }
    }
  }
  if (-not $tag) { Fail "no published installer for Windows yet. See https://cbassuarez.com/nus.dev/download/" }
  if (-not (Has-Package $tag)) { Fail "$tag has no installer for $target." }
  $version = $tag.TrimStart('v')
  $file = "nus-$version-$target-setup.exe"
  $channel = if ($tag -like '*-preview.*') { 'preview' } else { 'release' }
  $app = Join-Path $env:LOCALAPPDATA "Programs\nus\$channel"

  # --- what is there already -------------------------------------------------------
  $have = $null
  if (Test-Path "$app\nus.exe") {
    $out = Join-Path ([IO.Path]::GetTempPath()) "nus-version-$([Guid]::NewGuid().ToString('n')).txt"
    try {
      $v = Start-Process "$app\nus.exe" -ArgumentList '--version' -Wait -PassThru -NoNewWindow -RedirectStandardOutput $out
      if ($v.ExitCode -eq 0) { $have = ((Get-Content $out -First 1) -split ' ')[1] }
    } catch { } finally { Remove-Item $out -ErrorAction SilentlyContinue }
  }
  $mode = if (-not $have) { 'install' } elseif ($have -eq $version) { 'current' } else { 'update' }

  $tagline = "nus unified environment $dot installer"
  if ($mode -eq 'update') { Banner $tagline "v$have $arrow v$version $dot $channel" } else { Banner $tagline "v$version $dot $channel" }
  switch ($mode) {
    'current' { Row '01' 'Found' "$version installed $dot up to date" $okMark (Took $begun); Finish 'current' $version; return }
    'update' { Row '01' 'Found' "$have $arrow $version" $okMark (Took $begun) }
    default { Row '01' 'Found' "$target $dot for this user" $okMark (Took $begun) }
  }
  $verb = if ($mode -eq 'update') { 'Update' } else { 'Install' }

  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("nus-install-" + [Guid]::NewGuid().ToString('n').Substring(0, 8))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    $setup = Join-Path $tmp $file
    Fetch "$dl/$tag/$file" $setup (Get-Sums $tag)
    $log = Join-Path ([IO.Path]::GetTempPath()) 'nus-install.log'
    Remove-Item $log -ErrorAction SilentlyContinue
    Stream $verb 'the signed installer' $app $setup @('/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART', '/TASKS=path', "/LOG=`"$log`"") $log
    # The installer added bin to the user PATH; this session sees it too.
    if (($env:Path -split ';') -notcontains "$app\bin") { $env:Path = "$env:Path;$app\bin" }
    Finish $mode $version
  } finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  }
}

# Under `irm | iex` this runs in the caller's own session: give it back its
# error preference, and never end silently. Fail has already said why; anything
# else is said here.
try { Main } catch {
  if (-not $tty) { Write-Error $_ -ErrorAction Continue }
  elseif ($_.FullyQualifiedErrorId -ne 'nus-install') {
    Clear-Line
    [Console]::WriteLine("  $red$bold$bad$reset $($_.Exception.Message)")
  }
} finally { $ErrorActionPreference = $callerErrors }
