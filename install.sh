#!/bin/sh
# Installs or updates nus on macOS (Apple silicon) or Linux (x86-64) from
# GitHub Releases.
#
#   curl -fsSL https://cbassuarez.com/nus.dev/install.sh | sh
#
# It picks the newest release with a package for this machine (stable if there
# is one, else preview) and checks every download against that release's
# SHA256SUMS.txt. Then:
#
#   macOS            nus.app into /Applications (or ~/Applications)
#   Debian, Ubuntu   the release's .deb, with apt (asks for sudo): it sets up
#                    Chromium's sandbox, and apt keeps nus updated from then on
#   other Linux      the archive, installed for your account by its own
#                    install-desktop.sh; nus updates itself
#
# Run again, it updates the copy it finds, or says it is up to date. Every way
# ends with the `nus` command on your PATH. Read it first if you like.
#
#   NUS_CHANNEL=preview   take the preview channel even if a stable exists
#   NUS_VERSION=v0.0.1    install one exact tag
#   NUS_USER=1            Linux: install for this account only, without apt or sudo
#   NUS_BIN=~/bin         macOS: where the `nus` link goes (default: ~/.local/bin)
#   NO_COLOR=1            no colour; a pipe or a log gets plain lines anyway
set -eu

repo="cbassuarez/nus"
api="https://api.github.com/repos/$repo/releases"
dl="https://github.com/$repo/releases/download"

# --- how it looks ---------------------------------------------------------
# A terminal gets colour, lines that redraw in place and the wordmark settling
# out of noise; a pipe or a log gets one plain line per step. Symbols are UTF-8
# only in a UTF-8 locale. Nothing is written but text, newlines and, in a
# terminal, carriage returns and cursor moves.
esc=$(printf '\033')
if [ -t 1 ] && [ "${TERM:-dumb}" != dumb ]; then tty=1; else tty=; fi
case "${LC_ALL:-${LC_CTYPE:-${LANG:-}}}" in *[Uu][Tt][Ff]-8*|*[Uu][Tt][Ff]8*) utf=1 ;; *) utf= ;; esac
if [ -n "$tty" ] && [ -z "${NO_COLOR:-}" ]; then
  reset="$esc[0m"; bold="$esc[1m"; grey="$esc[90m"; faint="$esc[2;90m"
  case "${COLORTERM:-}" in truecolor|24bit) red="$esc[38;2;224;87;76m" ;; *) red="$esc[31m" ;; esac
else
  reset=; bold=; grey=; faint=; red=
fi
if [ -n "$utf" ]; then
  ok='✓'; bad='✗'; dot='·'; full='▰'; empty='▱'; rule='─'; gutter='│'; arrow='→'; more='…'
  spin='⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏'; noise='░ ▒ ▓ # % & * + = - :'
else
  ok='+'; bad='x'; dot='-'; full='#'; empty='-'; rule='-'; gutter='|'; arrow='->'; more='...'
  spin='| / - \'; noise='# % & * + = - :'
fi
cols=$(tput cols 2>/dev/null || echo 80); [ "$cols" -ge 40 ] 2>/dev/null || cols=80

say() { printf '%s\n' "$*"; }
need() { command -v "$1" >/dev/null 2>&1 || die "this needs $1 on PATH"; }

# Milliseconds, where date can say (GNU); whole seconds elsewhere.
now() { n=$(date +%s%N 2>/dev/null || true); case $n in ''|*N) echo $(( $(date +%s) * 1000 )) ;; *) echo $(( n / 1000000 )) ;; esac; }
took() { awk -v ms="$(( $(now) - $1 ))" 'BEGIN { printf "%.1fs", ms / 1000 }'; }
chars() { printf '%s' "$1" | wc -m | tr -d ' '; }
pad() { s=$1; n=$(( $2 - $(chars "$1") )); while [ "$n" -gt 0 ]; do s="$s "; n=$((n - 1)); done; printf '%s' "$s"; }
repeat() { s=; n=$2; while [ "$n" -gt 0 ]; do s="$s$1"; n=$((n - 1)); done; printf '%s' "$s"; }
spinner() { i=$(( $1 % $(printf '%s\n' "$spin" | wc -w) + 1 )); printf '%s\n' "$spin" | cut -d' ' -f$i; }
# A process still running; one that has exited but is not yet reaped is done.
alive() { st=$(ps -o stat= -p "$1" 2>/dev/null) || return 1; case $st in ''|*Z*) return 1 ;; esac; }

# One step of the manifest: number, name, detail, status, time.
row() { # n name detail mark time
  printf '  %s%s%s  %s%s%s%s  %s%s\n' "$grey" "$1" "$reset" "$bold" "$(pad "$2" 10)" "$reset" "$grey$(pad "$3" 52)$reset" "$4" "$grey$(printf '%7s' "$5")$reset"
}
okmark="$red$bold$ok$reset"

# The step at the cursor, redrawn in place (a terminal only).
redraw() { [ -n "$tty" ] && printf '\r%s[2K' "$esc"; }

die() {
  [ -n "$tty" ] && printf '\r%s[2K' "$esc"
  printf '  %s%s%s %s\n' "$red$bold" "$bad" "$reset" "$*" >&2
  exit 1
}

# --- the wordmark ---------------------------------------------------------
B1='   _ __  _   _ ___ '
B2="  | '_ \\| | | / __|"
B3='  | | | | |_| \__ \'
B4='  |_| |_|\__,_|___/'
banner() { # tagline version
  if [ -z "$tty" ]; then
    printf '\n  %s\n  %s   %s\n  %s   %s\n  %s\n\n' "$B1" "$B2" "$1" "$B3" "$2" "$B4"
    return
  fi
  printf '\n\n\n\n\n'
  # Each letter is noise until its moment, flashes red as it lands, then
  # holds; left to right, the way nus's split-flap board settles.
  B1=$B1 B2=$B2 B3=$B3 B4=$B4 TAG=$1 VER=$2 ESC=$esc RED=$red BOLD=$bold FAINT=$faint GREY=$grey RESET=$reset NOISE=$noise \
  awk 'BEGIN {
    e = ENVIRON["ESC"]; r[1] = ENVIRON["B1"]; r[2] = ENVIRON["B2"]; r[3] = ENVIRON["B3"]; r[4] = ENVIRON["B4"]
    n = split(ENVIRON["NOISE"], noise, " ")
    for (f = 0; f <= 42; f++) {
      t = f * 35
      printf "%s[4A", e
      for (k = 1; k <= 4; k++) {
        line = "  "
        for (c = 1; c <= length(r[k]); c++) {
          ch = substr(r[k], c, 1); at = 150 + c * 55 + k * 25
          if (ch == " ") line = line " "
          else if (t < at) line = line ENVIRON["FAINT"] noise[(f + k * 7 + c * 13) % n + 1] ENVIRON["RESET"]
          else if (t < at + 160) line = line ENVIRON["RED"] ENVIRON["BOLD"] ch ENVIRON["RESET"]
          else line = line ENVIRON["BOLD"] ch ENVIRON["RESET"]
        }
        if (f == 42 && k == 2) line = line "   " ENVIRON["BOLD"] ENVIRON["TAG"] ENVIRON["RESET"]
        if (f == 42 && k == 3) line = line "   " ENVIRON["GREY"] ENVIRON["VER"] ENVIRON["RESET"]
        printf "\r%s%s[K\n", line, e
      }
      fflush()
      if (f < 42) system("sleep 0.035")
    }
  }'
  printf '\n'
}

# --- downloads ------------------------------------------------------------
# Fetch one file of the release into $tmp with a live bar, then check it
# against SHA256SUMS.txt. GitHub serves a `~` in an asset's name as `.`.
fetch() { # n file
  url="$dl/$tag/$(printf '%s' "$2" | tr '~' '.')"
  start=$(now)
  size=$(curl -fsIL "$url" 2>/dev/null | tr -d '\r' | awk 'tolower($1) == "content-length:" { n = $2 } END { print n + 0 }')
  if [ -n "$tty" ]; then
    curl -fsL -o "$tmp/$2" "$url" 2>/dev/null & cpid=$!
    i=0
    while alive "$cpid"; do
      got=$(wc -c < "$tmp/$2" 2>/dev/null | tr -d ' ' || echo 0)
      [ -n "$got" ] || got=0
      if [ "$size" -gt 0 ]; then pct=$(( got * 100 / size )); else pct=0; fi
      seg=$(( pct / 5 )); [ "$seg" -gt 20 ] && seg=20
      redraw
      printf '  %s%s%s  %s%s%s%s %s%s%s%s  %s  %s' "$grey" "$1" "$reset" "$bold" "$(pad Download 10)" "$reset" \
        "$red$(spinner $i)$reset" "$red" "$(repeat "$full" "$seg")" "$faint$(repeat "$empty" $((20 - seg)))" "$reset" \
        "$(printf '%3s%%' "$pct")" "$grey$(( got / 1048576 )) / $(( size / 1048576 )) MB$reset"
      i=$((i + 1)); sleep 0.1
    done
    wait "$cpid" || die "the download of $2 failed"
    redraw
  else
    curl -fsSL -o "$tmp/$2" "$url" || die "the download of $2 failed"
  fi
  mb=$(( $(wc -c < "$tmp/$2") / 1048576 ))
  row "$1" Download "$2 $dot $mb MB" "$okmark" "$(took "$start")"
  start=$(now)
  want=$(grep -- " $2\$" "$tmp/SHA256SUMS.txt" | cut -d' ' -f1)
  if command -v sha256sum >/dev/null 2>&1; then got=$(sha256sum "$tmp/$2" | cut -d' ' -f1)
  else got=$(shasum -a 256 "$tmp/$2" | cut -d' ' -f1); fi
  [ -n "$want" ] && [ "$want" = "$got" ] || die "$2 does not match the release's SHA256SUMS (expected $want, got $got)"
  row 03 Verify "sha256 $(printf '%s' "$got" | cut -c1-8)$more$(printf '%s' "$got" | cut -c58-)" "$okmark" "$(took "$start")"
}

# --- installing -----------------------------------------------------------
# Run a command with its output in a dimmed, indented window of its last four
# lines; on success the window folds into the step's line, on failure all of
# it stays, with the log's path.
stream() { # n name detail-while detail-done log command...
  n=$1 name=$2 doing=$3 done=$4 log=$5; shift 5
  start=$(now)
  if [ -z "$tty" ]; then
    "$@" >"$log" 2>&1 || { sed "s/^/      $gutter /" "$log"; die "$name failed; the log is $log"; }
    row "$n" "$name" "$done" "$okmark" "$(took "$start")"
    return
  fi
  "$@" >"$log" 2>&1 & pid=$!
  shown=0; i=0
  while alive "$pid"; do
    [ "$shown" -gt 0 ] && printf '%s[%dA' "$esc" "$shown"
    redraw; row "$n" "$name" "$doing" "$grey$(spinner $i)$reset" "$(took "$start")"
    lines=$(tail -n 4 "$log" 2>/dev/null | cut -c1-$((cols - 12)))
    k=0
    if [ -n "$lines" ]; then
      printf '%s\n' "$lines" | while IFS= read -r l; do printf '\r%s[2K      %s%s %s%s\n' "$esc" "$faint" "$gutter" "$l" "$reset"; done
      k=$(printf '%s\n' "$lines" | wc -l | tr -d ' ')
    fi
    shown=$((k + 1)); i=$((i + 1)); sleep 0.1
  done
  wait "$pid" && status=0 || status=$?
  printf '%s[%dA%s[J' "$esc" "$shown" "$esc"
  if [ "$status" -ne 0 ]; then
    row "$n" "$name" "$doing" "$red$bold$bad$reset" "$(took "$start")"
    sed "s/^/      $faint$gutter$reset /" "$log"
    die "$name failed; the full log is $log"
  fi
  row "$n" "$name" "$done" "$okmark" "$(took "$start")"
}

finish() { # how updates arrive · whether this was an update
  printf '  %s\n' "$faint$(repeat "$rule" 81)$reset"
  if [ "$2" = update ]; then printf '  Restart  %snus%s  %sto use %s%s\n\n' "$red$bold" "$reset" "$grey" "$version" "$reset"
  elif [ "$2" = current ]; then printf '  nus %s is up to date. Run  %snus%s\n\n' "$version" "$red$bold" "$reset"
  else printf '  Run  %snus%s\n\n' "$red$bold" "$reset"; fi
  printf '  %s%s\n' "$(pad 'nus --help' 16)" "${grey}everything the command does$reset"
  printf '  %s%s\n\n' "$(pad updates 16)" "$grey$1$reset"
}

main() {
  need curl

  # --- which package ------------------------------------------------------
  os=$(uname -s); arch=$(uname -m)
  case "$os/$arch" in
    Darwin/arm64)   target=macos-arm64;  ext=zip ;;
    Darwin/*)       die "Intel Macs are not a target; nus builds for Apple silicon." ;;
    Linux/x86_64)   target=linux-x86_64; ext=tar.gz ;;
    Linux/*)        die "Linux builds are x86-64 only for now (this is $arch)." ;;
    *)              die "no package for $os/$arch. See https://cbassuarez.com/nus.dev/download/" ;;
  esac

  # --- which release ------------------------------------------------------
  begun=$(now)
  tags_of() { sed -n 's/.*"tag_name": *"\(v[^"]*\)".*/\1/p'; }
  has_package() { curl -fsSL "$dl/$1/SHA256SUMS.txt" 2>/dev/null | grep -q -- "-$target\.$ext\$"; }
  tag=${NUS_VERSION:-}
  if [ -z "$tag" ]; then
    if [ "${NUS_CHANNEL:-}" != "preview" ]; then
      stable=$(curl -fsSL "$api/latest" 2>/dev/null | tags_of | head -n1 || true)
      if [ -n "$stable" ] && has_package "$stable"; then tag=$stable; fi
    fi
    if [ -z "$tag" ]; then
      for t in $(curl -fsSL "$api?per_page=30" | tags_of); do
        case "$t" in *-preview.*) if has_package "$t"; then tag=$t; break; fi ;; esac
      done
    fi
  fi
  [ -n "$tag" ] || die "no published package for $target yet. See https://cbassuarez.com/nus.dev/download/"
  has_package "$tag" || die "$tag has no package for $target."
  version=${tag#v}
  name="nus-$version-$target"
  case "$tag" in *-preview.*) channel=preview; dir=preview; pkg=nus-preview ;; *) channel=stable; dir=release; pkg=nus ;; esac

  tmp=$(mktemp -d "${TMPDIR:-/tmp}/nus-install.XXXXXX")
  trap 'rm -rf "$tmp"' EXIT
  trap 'exit 1' INT TERM
  log="${TMPDIR:-/tmp}/nus-install.log"
  curl -fsSL -o "$tmp/SHA256SUMS.txt" "$dl/$tag/SHA256SUMS.txt"

  # --- how, and what is there already -------------------------------------
  data=${XDG_DATA_HOME:-$HOME/.local/share}
  deb=$(sed -n 's/^[0-9a-f]\{64\}  \(nus[a-z-]*_[^ ]*_amd64\.deb\)$/\1/p' "$tmp/SHA256SUMS.txt" | head -n1)
  how=archive
  if [ "$target" = macos-arm64 ]; then how=app
  elif [ -z "${NUS_USER:-}" ] && [ -n "$deb" ] && command -v apt-get >/dev/null 2>&1 && command -v dpkg >/dev/null 2>&1; then how=deb; fi
  case $how in
    deb) exe="/opt/$pkg/nus"; where="/opt/$pkg"; updates='arrive through apt' ;;
    app) apps=/Applications; [ -w "$apps" ] || apps="$HOME/Applications"; exe="$apps/nus.app/Contents/MacOS/nus"; where="$apps/nus.app"; updates='arrive inside nus' ;;
    *) exe="$data/nus/app/$dir/nus"; where="$data/nus/app/$dir"; updates='arrive inside nus' ;;
  esac
  have=$("$exe" --version 2>/dev/null | awk 'NR == 1 { print $2 }' || true)
  mode=install
  [ -n "$have" ] && mode=update
  [ "$have" = "$version" ] && mode=current

  case $mode in
    update) banner "nus unified environment $dot installer" "v$have $arrow v$version $dot $channel" ;;
    *) banner "nus unified environment $dot installer" "v$version $dot $channel" ;;
  esac
  case $how in deb) kind="Debian/Ubuntu $dot apt" ;; app) kind="macOS $dot nus.app" ;; *) kind="for this account" ;; esac
  case $mode in
    current) row 01 Found "$version installed $dot up to date" "$okmark" "$(took "$begun")"; finish "$updates" current; return ;;
    update) row 01 Found "$have $arrow $version" "$okmark" "$(took "$begun")" ;;
    *) row 01 Found "$target $dot $kind" "$okmark" "$(took "$begun")" ;;
  esac
  verb=Install; [ "$mode" = update ] && verb=Update

  if [ "$how" = deb ]; then
    fetch 02 "$deb"
    # apt reads a local package as its own unprivileged user.
    chmod 755 "$tmp"; chmod 644 "$tmp/$deb"
    if [ "$(id -u)" = 0 ]; then sudo=
    elif command -v sudo >/dev/null 2>&1; then sudo=sudo
    else die "installing the .deb needs root: run this as root, or with NUS_USER=1 to install for this account only"; fi
    if [ -n "$sudo" ] && ! sudo -n true 2>/dev/null; then
      row 04 "$verb" 'with apt (sudo)' "$grey$(spinner 0)$reset" ''
      sudo -v || die "sudo was refused; nothing was installed"
      # The step and the password prompt make way for the step's own line.
      [ -n "$tty" ] && printf '%s[2A%s[J' "$esc" "$esc"
    fi
    stream 04 "$verb" 'with apt (sudo)' "$where" "$log" $sudo apt-get install -y "$tmp/$deb"
    finish "$updates" "$mode"
    return
  fi

  fetch 02 "$name.$ext"
  if [ "$how" = app ]; then
    need ditto
    stream 04 "$verb" "nus.app" "$where" "$log" sh -c '
      ditto -x -k "$1" "$2/unpacked" && [ -d "$2/unpacked/nus.app" ] && rm -rf "$3/nus.app" && ditto "$2/unpacked/nus.app" "$3/nus.app"
    ' sh "$tmp/$name.zip" "$tmp" "$apps"
    bin=${NUS_BIN:-$HOME/.local/bin}
    mkdir -p "$bin"
    ln -sf "$apps/nus.app/Contents/Resources/bin/nus" "$bin/nus"
    finish "$updates" "$mode"
    case ":$PATH:" in *":$bin:"*) ;; *) say "  ${grey}add $bin to your PATH to use the nus command$reset"; say ;; esac
    return
  fi

  tar -xzf "$tmp/$name.tar.gz" -C "$tmp"
  if grep -q -- --uninstall "$tmp/$name/install-desktop.sh" 2>/dev/null; then
    stream 04 "$verb" 'for this account' "$where" "$log" sh "$tmp/$name/install-desktop.sh"
    finish "$updates" "$mode"
    # What the package's own installer has to say about this machine.
    grep -A3 -e 'blocks the user namespaces' -e 'to PATH to run' "$log" | sed 's/^/  /' || true
    return
  fi
  # Releases before the archive could install itself: keep the folder and
  # link its command; ./nus inside it starts the app.
  rm -rf "$where"; mkdir -p "$(dirname "$where")"
  mv "$tmp/$name" "$where"
  mkdir -p "$HOME/.local/bin"
  ln -sf "$where/bin/nus" "$HOME/.local/bin/nus"
  row 04 "$verb" "$where" "$okmark" ''
  finish "$updates" "$mode"
}

# Nothing runs until the whole script has arrived.
main "$@"
