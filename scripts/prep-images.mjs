/**
 * One-off asset pipeline.
 *
 * Client photography comes in three flavours: studio shots on a light grey/white
 * sweep, shots already cut out to alpha, and location photography. Product tiles
 * only look like one system if every glove floats on the same tile, so studio
 * backgrounds get knocked out here (edge-connected flood fill, so we never eat
 * white leather inside the glove) and everything is trimmed to the same padding.
 *
 * Run from glover-next/:  node scripts/prep-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const RAW = process.argv[2];
if (!RAW) {
  console.error("usage: node scripts/prep-images.mjs <raw-image-dir>");
  process.exit(1);
}
const OUT = path.join(process.cwd(), "public", "images");

/** src is relative to RAW; kind decides the treatment. */
const JOBS = [
  // ---- product: studio sweep, needs knockout -------------------------------
  { src: "01_IMG_6165.png", out: "products/pro-elite-hh-red.png", kind: "knockout" },
  { src: "30_IMG_6190.jpg", out: "products/pro-elite-hh-gold.png", kind: "knockout" },
  { src: "25_Untitled+design+%283%29.png", out: "products/classics-black-gold.png", kind: "knockout" },

  // ---- product: already cut out -------------------------------------------
  { src: "27_1.png", out: "products/pro-elite-hh-blue.png", kind: "alpha" },
  { src: "03_4.png", out: "products/pro-elite-hh-white.png", kind: "alpha" },
  { src: "17_5.png", out: "products/pro-elite-hh-black.png", kind: "alpha" },
  { src: "22_3.png", out: "products/pro-elite-hh-white-gold.png", kind: "alpha" },
  { src: "02_6.png", out: "products/bag-mitts-black.png", kind: "alpha" },

  // ---- product: in-situ detail shots (kept as photos) ----------------------
  { src: "16_DSC00013.JPG", out: "products/detail-crown-logo.jpg", kind: "photo" },
  { src: "13_DSC00047.jpg", out: "products/gloves-black-chair.jpg", kind: "photo" },
  { src: "32_DSC00063.JPG", out: "products/gloves-white-gold-chair.jpg", kind: "photo" },
  { src: "28_image6+%281%29.jpeg", out: "products/athlete-red-gold-glove.jpg", kind: "photo" },

  // ---- lifestyle -----------------------------------------------------------
  { src: "15_IMG_6191.PNG", out: "lifestyle/fight-night-victory.jpg", kind: "photo" },
  { src: "26_IMG_6192.jpg", out: "lifestyle/fight-night-collage.jpg", kind: "photo" },
  { src: "33_IMG_5104+3.jpg", out: "lifestyle/fighter-guard.jpg", kind: "photo" },
  { src: "18_IMG_5777.JPG", out: "lifestyle/coach-lacing-up.jpg", kind: "photo" },
  { src: "04_IMG_9928.jpg", out: "lifestyle/pro-fight-jab.jpg", kind: "photo" },
  { src: "21_IMG_9927.jpg", out: "lifestyle/pro-fight-cross.jpg", kind: "photo" },
  { src: "29_IMG_5783+2.JPG", out: "lifestyle/gym-two-fighters.jpg", kind: "photo" },
  { src: "31_image0.jpeg", out: "lifestyle/gym-pad-work.jpg", kind: "photo" },
  { src: "20_AB6835C4-5DCA-4C10-9F00-993EF3431462.jpg", out: "lifestyle/ring-canvas-gear.jpg", kind: "photo" },
  { src: "09_image-asset.jpeg", out: "lifestyle/strength-training.jpg", kind: "photo" },
  { src: "10_image-asset.jpeg", out: "lifestyle/conditioning.jpg", kind: "photo" },
  { src: "12_image-asset.jpeg", out: "lifestyle/amateur-bout.jpg", kind: "photo" },

  // ---- brand ---------------------------------------------------------------
  { src: "14_GLOVER+SPORTS+GOLD.PNG", out: "brand/glover-sports-lockup.png", kind: "alpha" },
  { src: "19_image2.png", out: "brand/crown-mark.png", kind: "photo" },
];

const MAX_EDGE = 1600;

/**
 * Knock out an edge-connected studio background.
 * Only pixels reachable from the border are cleared, so white leather in the
 * middle of a glove survives. The tight/loose pair gives an antialiased edge.
 */
function knockoutBackground(data, width, height, channels) {
  const px = (x, y) => (y * width + x) * channels;

  // Background reference = median of the four corners.
  const corners = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ].map(([x, y]) => {
    const i = px(x, y);
    return [data[i], data[i + 1], data[i + 2]];
  });
  const ref = [0, 1, 2].map((c) => {
    const vals = corners.map((v) => v[c]).sort((a, b) => a - b);
    return (vals[1] + vals[2]) / 2;
  });

  const TIGHT = 26; // fully transparent at or below this distance
  const LOOSE = 62; // still considered connected background above TIGHT

  const dist = (i) =>
    Math.abs(data[i] - ref[0]) + Math.abs(data[i + 1] - ref[1]) + Math.abs(data[i + 2] - ref[2]);

  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) {
    stack.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    stack.push([0, y], [width - 1, y]);
  }

  const alpha = new Uint8Array(width * height).fill(255);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    const d = dist(px(x, y));
    if (d > LOOSE) continue;
    visited[idx] = 1;
    alpha[idx] = d <= TIGHT ? 0 : Math.round(((d - TIGHT) / (LOOSE - TIGHT)) * 255);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return alpha;
}

async function run() {
  for (const job of JOBS) {
    const src = path.join(RAW, job.src);
    if (!fs.existsSync(src)) {
      console.warn("skip (missing):", job.src);
      continue;
    }
    const dest = path.join(OUT, job.out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    try {
      if (job.kind === "photo") {
        await sharp(src)
          .rotate()
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 84, mozjpeg: true })
          .toFile(dest);
      } else if (job.kind === "alpha") {
        await sharp(src)
          .ensureAlpha()
          .trim({ threshold: 2 })
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ compressionLevel: 9, quality: 90 })
          .toFile(dest);
      } else {
        // Some sources already carry an alpha channel whose transparent pixels
        // hold garbage RGB — flatten onto white first so the knockout below has
        // a real background colour to key against.
        const base = sharp(src).rotate().flatten({ background: "#ffffff" });
        const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
        const alpha = knockoutBackground(data, info.width, info.height, info.channels);

        const rgba = Buffer.alloc(info.width * info.height * 4);
        for (let i = 0, j = 0; i < info.width * info.height; i++, j += 4) {
          const s = i * info.channels;
          rgba[j] = data[s];
          rgba[j + 1] = data[s + 1];
          rgba[j + 2] = data[s + 2];
          rgba[j + 3] = alpha[i];
        }

        await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
          .trim({ threshold: 2 })
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ compressionLevel: 9 })
          .toFile(dest);
      }
      const kb = (fs.statSync(dest).size / 1024).toFixed(0);
      console.log(`${job.kind.padEnd(8)} ${job.out.padEnd(44)} ${kb}kb`);
    } catch (err) {
      console.error("FAILED", job.src, err.message);
    }
  }
}

run();
