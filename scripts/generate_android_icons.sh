#!/usr/bin/env bash
set -e

SRC="public/icons/icon-512.png"
RES="android/app/src/main/res"

if [ ! -f "$SRC" ]; then
  echo "Source icon not found at $SRC"
  exit 1
fi

echo "Generating Android launcher icons from $SRC..."

# mdpi: 48x48 launcher, 108x108 foreground
sips -z 48 48 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher.png"
sips -z 48 48 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher_round.png"
sips -z 108 108 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher_foreground.png"

# hdpi: 72x72 launcher, 162x162 foreground
sips -z 72 72 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher.png"
sips -z 72 72 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher_round.png"
sips -z 162 162 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher_foreground.png"

# xhdpi: 96x96 launcher, 216x216 foreground
sips -z 96 96 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher.png"
sips -z 96 96 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher_round.png"
sips -z 216 216 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher_foreground.png"

# xxhdpi: 144x144 launcher, 324x324 foreground
sips -z 144 144 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher.png"
sips -z 144 144 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher_round.png"
sips -z 324 324 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher_foreground.png"

# xxxhdpi: 192x192 launcher, 432x432 foreground
sips -z 192 192 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher.png"
sips -z 192 192 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher_round.png"
sips -z 432 432 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher_foreground.png"

# Splash screen drawable
sips -z 480 480 "$SRC" --out "$RES/drawable/splash.png"

echo "Android icons generated successfully."
