# Praesto · refined A / B brand set

Primary direction: **B · Split-pill bowl**. Alternate: **A · Capsule + target**.

The lower-case wordmark uses **JetBrains Mono 550**, with -0.02em tracking. Every production SVG wordmark is outlined from the local licensed font, so its shape is portable and independent of installed fonts. The original exploration sheet is preserved at `public/praesto-logo-explorations.svg`.

## Files

Both directions contain horizontal, stacked, monogram, optical favicon and transparent app-icon lockups in light and dark-accent versions. Light-accent files use ink #17191d and signal #0a8f5a. Dark-accent files use white and signal #3ddc97 for inverse surfaces.

All five logo forms have transparent SVG and PNG exports. Optional app-tile variants provide platform icon fields; their PNGs have opaque square corners so the operating system can apply its own mask. The app-icon artwork fits within the central maskable safe area.

- 24 SVG assets: 20 requested logo forms plus 4 optional platform tiles.
- 68 PNG exports: favicons at 16/24/32/48/64/128px; app artwork and platform tiles at 180/192/512/1024px; horizontal at 1600px; stacked at 960px; monograms at 512px.
- Four ICO files, each with 16/32/48px entries.
- One adaptive B SVG favicon that changes ink for light/dark browser chrome.

`manifest.json` records geometry, palette, type, source-font identity and alpha validation. The foreground-only forms were checked for transparent pixels. Platform PNG tiles were checked for full opacity.

## Geometry and use

Both marks share a 120-unit grid, a 20 × 92 pill stem with 10-unit end radii, a 31-unit outer bowl and 9-unit ring. B has a 6-unit split; its optical favicon widens that split to 8 units and strengthens the stem. A uses the same bowl and stem with a centered target dot.

Keep the mark upright and preserve the gap between it and the wordmark. Use horizontal lockups at 160px or wider. Use the dedicated favicon geometry at 16–32px, rather than shrinking a horizontal logo. Leave at least one stem-width of clear space around a standalone mark. Gallery backgrounds are preview surfaces and are not baked into transparent assets.

## Rebuild

1. Install `fonttools==4.67.0` and `brotli==1.2.0` into an isolated tools folder.
2. Run `python dev/build-praesto-brand.py --tools-path <tools-folder>`.
3. Run `node dev/render-praesto-brand.mjs --modules <module-folder-containing-sharp>`.

The generator reads the existing self-hosted JetBrains Mono WOFF2 face. Its SIL Open Font License is included as `JetBrains-Mono-OFL.txt`. Font attribution and artwork licensing remain distinct.
