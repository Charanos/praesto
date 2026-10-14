import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const args = process.argv.slice(2);
const modules = args[args.indexOf("--modules") + 1];
if (!modules || !args.includes("--modules"))
  throw new Error(
    "Pass --modules with a Node module directory containing sharp.",
  );
const sharp = createRequire(import.meta.url)(path.resolve(modules, "sharp"));
const out = path.resolve("public/brand/praesto");
const served = path.resolve("static/brand/praesto");
const manifest = JSON.parse(
  await fs.readFile(path.join(out, "manifest.json"), "utf8"),
);
const rendered = [];
async function png(file, width, target) {
  let source = await fs.readFile(path.join(out, file), "utf8");
  const platform = file.includes("-app-tile-");
  if (platform) source = source.replace('rx="112"', 'rx="0"');
  let pipeline = sharp(Buffer.from(source)).resize({ width });
  if (platform) pipeline = pipeline.removeAlpha();
  const buffer = await pipeline.png().toBuffer();
  await fs.writeFile(path.join(out, target), buffer);
  await fs.writeFile(path.join(served, target), buffer);
  const stats = await sharp(buffer).stats();
  const metadata = await sharp(buffer).metadata();
  const alpha = metadata.hasAlpha ? stats.channels.at(-1) : null;
  rendered.push({
    file: target,
    width: metadata.width,
    height: metadata.height,
    transparent: alpha?.min === 0,
    opaque: !alpha || alpha.min === 255,
  });
  return buffer;
}
for (const asset of manifest.assets) {
  const sizes =
    asset.kind === "favicon"
      ? [16, 24, 32, 48, 64, 128]
      : asset.kind === "app-icon" || asset.kind === "app-tile"
        ? [1024, 512, 192, 180]
        : asset.kind === "horizontal"
          ? [1600]
          : asset.kind === "stacked"
            ? [960]
            : [512];
  for (const size of sizes)
    await png(asset.file, size, asset.file.replace(".svg", `-${size}.png`));
  if (asset.kind === "favicon") {
    const sizesICO = [16, 32, 48];
    const images = await Promise.all(
      sizesICO.map((size) =>
        fs.readFile(path.join(out, asset.file.replace(".svg", `-${size}.png`))),
      ),
    );
    const header = Buffer.alloc(6 + 16 * images.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);
    let offset = header.length;
    images.forEach((image, index) => {
      const at = 6 + 16 * index;
      header[at] = sizesICO[index];
      header[at + 1] = sizesICO[index];
      header.writeUInt16LE(1, at + 4);
      header.writeUInt16LE(32, at + 6);
      header.writeUInt32LE(image.length, at + 8);
      header.writeUInt32LE(offset, at + 12);
      offset += image.length;
    });
    const ico = Buffer.concat([header, ...images]);
    const name = asset.file.replace(".svg", ".ico");
    await fs.writeFile(path.join(out, name), ico);
    await fs.writeFile(path.join(served, name), ico);
  }
}
await fs.copyFile(
  path.join(out, "praesto-b-app-tile-light-180.png"),
  "static/apple-touch-icon.png",
);
await fs.copyFile(
  path.join(out, "praesto-b-favicon-light.ico"),
  "static/favicon.ico",
);
manifest.rasters = rendered;
await fs.writeFile(
  path.join(out, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
await fs.copyFile(
  path.join(out, "manifest.json"),
  path.join(served, "manifest.json"),
);
if (
  rendered.some((r) =>
    r.file.includes("-app-tile-") ? !r.opaque : !r.transparent,
  )
)
  throw new Error("Asset alpha validation failed.");
console.log(
  `Rendered and alpha-validated ${rendered.length} PNG assets; four ICO files and touch icon exported.`,
);
