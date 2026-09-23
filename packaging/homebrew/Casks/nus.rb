cask "nus" do
  version "0.0.1-preview.8"
  sha256 "eaa7ec4bd1a8e2413764489da975c243b5b24a337eb6f7d12cd37506202ade39"

  url "https://github.com/cbassuarez/nus/releases/download/v#{version}/nus-#{version}-macos-arm64.zip"
  name "nus"
  desc "Terminal emulator that is also a browser"
  homepage "https://cbassuarez.com/nus.dev/"

  livecheck do
    url "https://github.com/cbassuarez/nus/releases"
    regex(%r{/v?(\d+(?:\.\d+)+(?:-preview\.\d+)?)/nus-[^/]+-macos-arm64\.zip}i)
    strategy :page_match
  end

  depends_on arch: :arm64

  app "nus.app"
  binary "#{appdir}/nus.app/Contents/Resources/bin/nus"

  caveats <<~EOS
    This is a preview build and is not notarized. The first time, right-click
    nus.app in Applications and choose Open, or install with --no-quarantine.
  EOS

  zap trash: [
    "~/Library/Application Support/nus",
    "~/Library/Caches/nus",
  ]
end
