#!/bin/sh
# Installs nus on macOS (Apple silicon) or Linux (x86-64) from GitHub Releases.
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
# Every way ends with the `nus` command on your PATH. Read it first if you
# like; it is short.
#
#   NUS_CHANNEL=preview   take the preview channel even if a stable exists
#   NUS_VERSION=v0.0.1    install one exact tag
#   NUS_USER=1            Linux: install for this account only, without apt or sudo
#   NUS_BIN=~/bin         macOS: where the `nus` link goes (default: ~/.local/bin)
set -eu

repo="cbassuarez/nus"
api="https://api.github.com/repos/$repo/releases"
dl="https://github.com/$repo/releases/download"

say() { printf '%s\n' "$*"; }
die() { printf 'nus: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "this needs $1 on PATH"; }

# GitHub's "latest" is the newest stable; previews are prereleases and are
# only listed. A tag counts when its checksum file names our package.
tags_of() { sed -n 's/.*"tag_name": *"\(v[^"]*\)".*/\1/p'; }
has_package() { curl -fsSL "$dl/$1/SHA256SUMS.txt" 2>/dev/null | grep -q -- "-$target\.$ext\$"; }

# Download one file of the release into $tmp and check it against SHA256SUMS.txt.
fetch() {
  say "downloading $1"
  # GitHub serves a `~` in an asset's name as `.` (preview 10's .deb).
  curl -fL --progress-bar -o "$tmp/$1" "$dl/$tag/$(printf '%s' "$1" | tr '~' '.')"
  want=$(grep -- " $1\$" "$tmp/SHA256SUMS.txt" | cut -d' ' -f1)
  if command -v sha256sum >/dev/null 2>&1; then got=$(sha256sum "$tmp/$1" | cut -d' ' -f1)
  else got=$(shasum -a 256 "$tmp/$1" | cut -d' ' -f1); fi
  [ -n "$want" ] && [ "$want" = "$got" ] || die "checksum mismatch for $1 (expected $want, got $got)"
  say "checksum ok"
}

main() {
  need curl

  # --- which package --------------------------------------------------------
  os=$(uname -s); arch=$(uname -m)
  case "$os/$arch" in
    Darwin/arm64)   target=macos-arm64;  ext=zip ;;
    Darwin/*)       die "Intel Macs are not a target; nus builds for Apple silicon." ;;
    Linux/x86_64)   target=linux-x86_64; ext=tar.gz ;;
    Linux/*)        die "Linux builds are x86-64 only for now (this is $arch)." ;;
    *)              die "no package for $os/$arch. See https://cbassuarez.com/nus.dev/download/" ;;
  esac

  # --- which release --------------------------------------------------------
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
  case "$tag" in *-preview.*) channel=preview ;; *) channel=stable ;; esac
  say "nus $tag ($channel) for $target"

  tmp=$(mktemp -d "${TMPDIR:-/tmp}/nus-install.XXXXXX")
  trap 'rm -rf "$tmp"' EXIT
  trap 'exit 1' INT TERM
  curl -fsSL -o "$tmp/SHA256SUMS.txt" "$dl/$tag/SHA256SUMS.txt"

  if [ "$target" = macos-arm64 ]; then
    need ditto
    fetch "$name.zip"
    apps=/Applications
    [ -w "$apps" ] || { apps="$HOME/Applications"; mkdir -p "$apps"; }
    ditto -x -k "$tmp/$name.zip" "$tmp/unpacked"
    [ -d "$tmp/unpacked/nus.app" ] || die "the archive did not contain nus.app"
    rm -rf "$apps/nus.app"
    ditto "$tmp/unpacked/nus.app" "$apps/nus.app"
    bin=${NUS_BIN:-$HOME/.local/bin}
    mkdir -p "$bin"
    ln -sf "$apps/nus.app/Contents/Resources/bin/nus" "$bin/nus"
    say "installed $apps/nus.app"
    case ":$PATH:" in *":$bin:"*) ;; *) say "add $bin to your PATH to use the nus command" ;; esac
    say "done. Run nus, or open it from Applications. It updates itself from GitHub Releases."
    return
  fi

  # --- Linux: the .deb, through apt ----------------------------------------
  deb=$(sed -n 's/^[0-9a-f]\{64\}  \(nus[a-z-]*_[^ ]*_amd64\.deb\)$/\1/p' "$tmp/SHA256SUMS.txt" | head -n1)
  if [ -z "${NUS_USER:-}" ] && [ -n "$deb" ] && command -v apt-get >/dev/null 2>&1 && command -v dpkg >/dev/null 2>&1; then
    if [ "$(id -u)" = 0 ]; then sudo=; elif command -v sudo >/dev/null 2>&1; then sudo=sudo
    else die "installing the .deb needs root: run this as root, or with NUS_USER=1 to install for this account only"; fi
    fetch "$deb"
    # apt reads a local package as its own unprivileged user.
    chmod 755 "$tmp"; chmod 644 "$tmp/$deb"
    say "installing $deb with apt"
    $sudo apt-get install -y "$tmp/$deb"
    say "done. Run nus, or open it from your applications. apt keeps it updated."
    return
  fi

  # --- Linux: the archive, for this account ---------------------------------
  fetch "$name.tar.gz"
  tar -xzf "$tmp/$name.tar.gz" -C "$tmp"
  if grep -q -- --uninstall "$tmp/$name/install-desktop.sh" 2>/dev/null; then
    sh "$tmp/$name/install-desktop.sh"
    say "done. nus updates itself from GitHub Releases."
    return
  fi
  # Releases before the archive could install itself: keep the folder and
  # link its command; ./nus inside it starts the app.
  app="${XDG_DATA_HOME:-$HOME/.local/share}/nus/app/$channel"
  rm -rf "$app"; mkdir -p "$(dirname "$app")"
  mv "$tmp/$name" "$app"
  mkdir -p "$HOME/.local/bin"
  ln -sf "$app/bin/nus" "$HOME/.local/bin/nus"
  say "installed $app; start it with $app/nus"
  say "runtime needs: glibc 2.35+, GTK 3, NSS, ALSA, a Vulkan driver (see $app/README.txt)"
}

# Nothing runs until the whole script has arrived.
main "$@"
