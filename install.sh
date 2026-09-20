#!/bin/sh
# Installs nus on macOS (Apple silicon) or Linux (x86-64) from GitHub Releases.
#
#   curl -fsSL https://cbassuarez.com/nus.dev/install.sh | sh
#
# What it does, in order: picks the newest release that has a package for
# this machine (stable if there is one, else preview), downloads it, checks
# it against the release's SHA256SUMS.txt, unpacks it, and puts `nus` on
# your PATH. Nothing runs as root; nothing is written outside the places
# named below. Read it first if you like — it is short.
#
#   NUS_CHANNEL=preview   take the preview channel even if a stable exists
#   NUS_VERSION=v0.0.1    install one exact tag
#   NUS_PREFIX=~/apps     Linux: where the app folder goes (default: XDG data)
#   NUS_BIN=~/bin         where the `nus` link goes (default: ~/.local/bin)
set -eu

repo="cbassuarez/nus"
api="https://api.github.com/repos/$repo/releases"
dl="https://github.com/$repo/releases/download"

say() { printf '%s\n' "$*"; }
die() { printf 'nus: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "this needs $1 on PATH"; }

need curl

# --- which package ----------------------------------------------------------
os=$(uname -s); arch=$(uname -m)
case "$os/$arch" in
  Darwin/arm64)          target=macos-arm64;  ext=zip ;;
  Darwin/*)              die "Intel Macs are not a target; nus builds for Apple silicon." ;;
  Linux/x86_64)          target=linux-x86_64; ext=tar.gz ;;
  Linux/*)               die "Linux builds are x86-64 only for now (this is $arch)." ;;
  *)                     die "no package for $os/$arch. See https://cbassuarez.com/nus.dev/download/" ;;
esac

# --- which release ----------------------------------------------------------
# GitHub's "latest" is the newest stable; previews are prereleases and are
# only listed. A tag counts when its checksum file names our package.
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
file="$name.$ext"
case "$tag" in *-preview.*) channel=preview ;; *) channel=stable ;; esac

say "nus $tag ($channel) for $target"

# --- download and verify ----------------------------------------------------
tmp=$(mktemp -d "${TMPDIR:-/tmp}/nus-install.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
say "downloading $file"
curl -fL --progress-bar -o "$tmp/$file" "$dl/$tag/$file"
curl -fsSL -o "$tmp/SHA256SUMS.txt" "$dl/$tag/SHA256SUMS.txt"

want=$(grep -- " $file\$" "$tmp/SHA256SUMS.txt" | cut -d' ' -f1)
if command -v sha256sum >/dev/null 2>&1; then got=$(sha256sum "$tmp/$file" | cut -d' ' -f1)
else got=$(shasum -a 256 "$tmp/$file" | cut -d' ' -f1); fi
[ "$want" = "$got" ] || die "checksum mismatch for $file (expected $want, got $got)"
say "checksum ok"

# --- install ----------------------------------------------------------------
bin=${NUS_BIN:-$HOME/.local/bin}
mkdir -p "$bin"

if [ "$target" = macos-arm64 ]; then
  need ditto
  apps=/Applications
  [ -w "$apps" ] || { apps="$HOME/Applications"; mkdir -p "$apps"; }
  ditto -x -k "$tmp/$file" "$tmp/unpacked"
  [ -d "$tmp/unpacked/nus.app" ] || die "the archive did not contain nus.app"
  rm -rf "$apps/nus.app"
  ditto "$tmp/unpacked/nus.app" "$apps/nus.app"
  ln -sf "$apps/nus.app/Contents/Resources/bin/nus" "$bin/nus"
  say "installed $apps/nus.app"
  if [ "$channel" = preview ]; then
    say "this preview is ad-hoc signed: the first time, right-click nus.app and choose Open."
  fi
else
  prefix=${NUS_PREFIX:-${XDG_DATA_HOME:-$HOME/.local/share}/nus}
  app="$prefix/app"
  mkdir -p "$prefix"
  rm -rf "$app.new"; mkdir -p "$app.new"
  tar -xzf "$tmp/$file" -C "$app.new" --strip-components=1
  rm -rf "$app"; mv "$app.new" "$app"
  ln -sf "$app/bin/nus" "$bin/nus"
  # A desktop entry that points at the unpacked folder, as README.txt says.
  desk="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
  mkdir -p "$desk"
  sed "s|^Exec=.*|Exec=$app/nus %U|; s|^Icon=.*|Icon=$app/nus.png|" "$app/nus.desktop" > "$desk/nus.desktop"
  command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$desk" 2>/dev/null || true
  say "installed $app"
  say "runtime needs: glibc 2.35+, GTK 3, NSS, ALSA, a Vulkan driver (see $app/README.txt)"
fi

case ":$PATH:" in
  *":$bin:"*) ;;
  *) say "add $bin to your PATH to use the nus command" ;;
esac
say "done. nus updates itself from GitHub Releases from here on; run this again any time."
