cask "nus" do
  version "0.0.2-preview.9"
  sha256 "3ba3c53279d257207ee1a29916d6b95b0127430fc696259b650fa975196c8e74"

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
