/**
 * Brand mark pipeline.
 *
 * Two client-supplied assets, two different problems:
 *  - the crown mark ships on a solid black plate, so the black is keyed out
 *    (its white outline survives because only edge-connected black is cleared);
 *  - the horizontal lockup ships with usable alpha already, so it is only
 *    trimmed and resized.
 *
 * Run from glover-next/:  node scripts/prep-logos.mjs [path-to-lockup.png]
 *
 * Outputs are committed, so this only needs re-running when the client sends
 * new brand files.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "images", "brand");
fs.mkdirSync(OUT, { recursive: true });

const SOURCES = {
  // black-plated mark pulled from weareglover.com
  crownPlate: path.join(OUT, "crown-mark.png"),
  // client-supplied horizontal lockup; pass a new path as argv[2] to refresh
  lockup: process.argv[2] ?? path.join(OUT, "glover-sports-lockup.png"),
};

/** Clear background connected to the image edge, keyed to the corner colour. */
function keyEdges(data, width, height, channels, tight = 46, loose = 105) {
  const px = (x, y) => (y * width + x) * channels;
  const corners = [
    [1, 1],
    [width - 2, 1],
    [1, height - 2],
    [width - 2, height - 2],
  ].map(([x, y]) => {
    const i = px(x, y);
    return [data[i], data[i + 1], data[i + 2]];
  });
  const ref = [0, 1, 2].map((c) => {
    const vals = corners.map((v) => v[c]).sort((a, b) => a - b);
    return (vals[1] + vals[2]) / 2;
  });

  const dist = (i) =>
    Math.abs(data[i] - ref[0]) + Math.abs(data[i + 1] - ref[1]) + Math.abs(data[i + 2] - ref[2]);

  const alpha = new Uint8Array(width * height).fill(255);
  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    const d = dist(px(x, y));
    if (d > loose) continue;
    visited[idx] = 1;
    alpha[idx] = d <= tight ? 0 : Math.round(((d - tight) / (loose - tight)) * 255);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return alpha;
}

async function knockout(src, dest, size) {
  const { data, info } = await sharp(src)
    .flatten({ background: "#000000" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alpha = keyEdges(data, info.width, info.height, info.channels);
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < info.width * info.height; i++, j += 4) {
    const s = i * info.channels;
    rgba[j] = data[s];
    rgba[j + 1] = data[s + 1];
    rgba[j + 2] = data[s + 2];
    rgba[j + 3] = alpha[i];
  }

  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 3 })
    .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

// 1. Crown mark, keyed off its black plate.
await knockout(SOURCES.crownPlate, path.join(OUT, "crown-mark-transparent.png"), 512);

// 2. Horizontal lockup — already has alpha, just tidy it up.
await sharp(SOURCES.lockup)
  .ensureAlpha()
  .trim({ threshold: 6 })
  .resize({ width: 1400, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, "glover-sports-lockup.png"));

// 3. Favicon / app icon: crown on the brand ink so it reads in a light tab bar.
await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 14, g: 14, b: 15, alpha: 1 } },
})
  .composite([
    {
      input: await sharp(path.join(OUT, "crown-mark-transparent.png"))
        .resize({ width: 380, height: 380, fit: "inside" })
        .toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toFile(path.join(process.cwd(), "app", "icon.png"));

for (const file of ["crown-mark-transparent.png", "glover-sports-lockup.png"]) {
  const meta = await sharp(path.join(OUT, file)).metadata();
  console.log(`${file.padEnd(32)} ${meta.width}x${meta.height}`);
}
console.log("app/icon.png                     512x512");
