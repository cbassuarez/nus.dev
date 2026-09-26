cask "nus" do
  version "0.0.2-preview.1"
  sha256 "b3a241f74b31c4fb204d941292e190f25ad0377ec888e4772573f1e3906cbf2a"

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
