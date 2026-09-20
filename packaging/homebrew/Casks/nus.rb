cask "nus" do
  version "0.0.1-preview.4"
  sha256 "8a5198f8d4343b0634b2e4686cedcaa3ede24025dedbad2e3676b20df201f9e6"

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
