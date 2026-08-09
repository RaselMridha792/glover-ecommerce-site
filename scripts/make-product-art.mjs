/**
 * Generates technical-flat product art for the apparel and equipment
 * categories, which the client has not photographed yet.
 *
 * These are deliberate stand-ins, not fake photography: flat vector renders in
 * the brand palette, cut out on transparency so they sit on the same cream
 * tile as the real glove shots. Swap the PNGs for studio photography when it
 * lands — the catalogue entries do not need to change.
 *
 * Run from glover-next/:  node scripts/make-product-art.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "images", "products");
fs.mkdirSync(OUT, { recursive: true });

const SIZE = 1200;

const PALETTES = {
  onyx: { base: "#212126", dark: "#141417", light: "#32323A", line: "#0B0B0D", trim: "#F1EBDA", mark: "#F1EBDA" },
  bone: { base: "#EFE9D8", dark: "#D6CDB4", light: "#FBF7EC", line: "#B9AF93", trim: "#17171A", mark: "#17171A" },
  crimson: { base: "#C0272D", dark: "#94171D", light: "#D6423F", line: "#7A1015", trim: "#F1EBDA", mark: "#F1EBDA" },
  gold: { base: "#C9A227", dark: "#9C7A16", light: "#E9B01F", line: "#7A5D0F", trim: "#17171A", mark: "#17171A" },
};

/** Simplified three-spike crown lifted from the Glover mark. */
function crown(cx, cy, w, fill, opacity = 1) {
  const h = w * 0.62;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const p = [
    `M ${x} ${y + h}`,
    `L ${x + w * 0.06} ${y + h * 0.22}`,
    `L ${x + w * 0.28} ${y + h * 0.6}`,
    `L ${x + w * 0.5} ${y}`,
    `L ${x + w * 0.72} ${y + h * 0.6}`,
    `L ${x + w * 0.94} ${y + h * 0.22}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
  return `<path d="${p}" fill="${fill}" opacity="${opacity}"/>
    <rect x="${x}" y="${y + h + w * 0.05}" width="${w}" height="${w * 0.09}" rx="${w * 0.03}" fill="${fill}" opacity="${opacity}"/>`;
}

/** Woven brand patch — the rectangle label stitched on every Glover product. */
function patch(cx, cy, w, h, fill, stroke) {
  return `
    <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h * 0.14}"
          fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    <rect x="${cx - w * 0.36}" y="${cy - h * 0.1}" width="${w * 0.72}" height="${h * 0.14}" rx="2" fill="${stroke}" opacity=".55"/>
    <rect x="${cx - w * 0.24}" y="${cy + h * 0.14}" width="${w * 0.48}" height="${h * 0.09}" rx="2" fill="${stroke}" opacity=".3"/>`;
}

const shadow = `<ellipse cx="600" cy="1075" rx="300" ry="34" fill="#0E0E0F" opacity=".16" filter="url(#soft)"/>`;

function frame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="soft" x="-40%" y="-200%" width="180%" height="500%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".16"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${shadow}
  ${inner}
</svg>`;
}

/* ------------------------------------------------------------------ *
 * Garments                                                            *
 * ------------------------------------------------------------------ */

function tee(c) {
  return frame(`
  <g stroke="${c.line}" stroke-width="4" stroke-linejoin="round">
    <path fill="${c.base}" d="
      M 470 250 C 470 250 430 236 400 232
      L 300 250 C 240 268 176 322 152 386
      C 140 418 138 444 142 470
      L 286 512 C 296 470 306 440 318 418
      L 300 900 C 300 918 312 928 330 928
      L 870 928 C 888 928 900 918 900 900
      L 882 418 C 894 440 904 470 914 512
      L 1058 470 C 1062 444 1060 418 1048 386
      C 1024 322 960 268 900 250
      L 800 232 C 770 236 730 250 730 250
      C 730 300 690 330 600 330 C 510 330 470 300 470 250 Z"/>
    <path fill="url(#sheen)" stroke="none" d="
      M 470 250 C 470 300 510 330 600 330 L 600 928 L 330 928 C 312 928 300 918 300 900
      L 318 418 C 306 440 296 470 286 512 L 142 470 C 138 444 140 418 152 386
      C 176 322 240 268 300 250 L 400 232 C 430 236 470 250 470 250 Z"/>
    <path fill="${c.dark}" d="
      M 470 250 C 470 250 500 216 600 216 C 700 216 730 250 730 250
      C 730 262 700 276 600 276 C 500 276 470 262 470 250 Z"/>
    <path fill="none" stroke="${c.line}" stroke-width="3" opacity=".55" d="M 286 512 L 318 418 M 914 512 L 882 418"/>
  </g>
  ${crown(600, 505, 150, c.mark, 0.95)}
  ${patch(600, 858, 190, 62, c.dark, c.trim)}`);
}

function hoodie(c) {
  return frame(`
  <g stroke="${c.line}" stroke-width="4" stroke-linejoin="round">
    <path fill="${c.dark}" d="
      M 424 268 C 430 176 496 130 600 130 C 704 130 770 176 776 268
      C 736 300 676 316 600 316 C 524 316 464 300 424 268 Z"/>
    <path fill="${c.base}" d="
      M 452 250 L 300 274 C 236 296 168 352 144 418
      C 132 452 130 480 134 508 L 284 552 C 294 508 304 476 318 452
      L 300 930 C 300 950 314 962 334 962 L 866 962 C 886 962 900 950 900 930
      L 882 452 C 896 476 906 508 916 552 L 1066 508 C 1070 480 1068 452 1056 418
      C 1032 352 964 296 900 274 L 748 250
      C 736 306 682 336 600 336 C 518 336 464 306 452 250 Z"/>
    <path fill="url(#sheen)" stroke="none" d="
      M 452 250 C 464 306 518 336 600 336 L 600 962 L 334 962 C 314 962 300 950 300 930
      L 318 452 C 304 476 294 508 284 552 L 134 508 C 130 480 132 452 144 418
      C 168 352 236 296 300 274 Z"/>
    <path fill="${c.light}" opacity=".5" d="
      M 460 700 L 740 700 L 762 856 C 762 866 754 872 744 872 L 456 872 C 446 872 438 866 438 856 Z"/>
    <path fill="none" d="M 460 700 L 740 700 L 762 856 C 762 866 754 872 744 872 L 456 872 C 446 872 438 866 438 856 Z"/>
    <path fill="${c.base}" d="M 300 930 L 900 930 L 900 962 C 900 982 886 994 866 994 L 334 994 C 314 994 300 982 300 962 Z"/>
    <path fill="none" stroke="${c.trim}" stroke-width="9" stroke-linecap="round" d="M 556 330 L 550 428 M 644 330 L 650 428"/>
  </g>
  <circle cx="550" cy="432" r="11" fill="${c.trim}"/>
  <circle cx="650" cy="432" r="11" fill="${c.trim}"/>
  ${crown(600, 552, 138, c.mark, 0.95)}
  ${patch(600, 800, 168, 56, c.dark, c.trim)}`);
}

function shorts(c) {
  return frame(`
  <g stroke="${c.line}" stroke-width="4" stroke-linejoin="round">
    <path fill="${c.base}" d="
      M 296 400 L 904 400
      C 926 560 950 720 986 936 C 990 958 978 972 956 972 L 704 972
      C 684 972 672 960 670 940 L 600 690 L 530 940
      C 528 960 516 972 496 972 L 244 972 C 222 972 210 958 214 936
      C 250 720 274 560 296 400 Z"/>
    <path fill="url(#sheen)" stroke="none" d="
      M 296 400 L 600 400 L 600 690 L 530 940 C 528 960 516 972 496 972 L 244 972
      C 222 972 210 958 214 936 C 250 720 274 560 296 400 Z"/>
    <path fill="${c.dark}" d="
      M 288 258 L 912 258 C 928 258 938 270 936 286 L 916 400 L 284 400 L 264 286
      C 262 270 272 258 288 258 Z"/>
    <path fill="none" stroke="${c.trim}" stroke-width="7" opacity=".8" d="M 286 318 L 914 318 M 288 366 L 912 366"/>
    <path fill="${c.light}" opacity=".4" d="M 232 890 L 292 620 L 336 630 L 276 906 Z"/>
    <path fill="${c.light}" opacity=".4" d="M 968 890 L 908 620 L 864 630 L 924 906 Z"/>
    <path fill="none" stroke="${c.trim}" stroke-width="8" opacity=".7" d="M 250 800 L 232 940 M 950 800 L 968 940"/>
  </g>
  ${crown(600, 560, 172, c.mark, 0.92)}
  ${patch(600, 340, 200, 54, c.base, c.trim)}`);
}

function wraps(c) {
  return frame(`
  <g stroke="${c.line}" stroke-width="4" stroke-linejoin="round">
    <!-- unrolled tail flowing out of the roll to a thumb loop -->
    <path fill="${c.base}" d="
      M 660 470 C 520 402 380 420 300 500 C 232 568 232 664 292 726
      C 336 772 400 786 452 764 L 424 700 C 396 710 364 704 344 682
      C 312 648 314 598 350 566 C 402 520 500 512 610 566 Z"/>
    <path fill="${c.dark}" opacity=".28" stroke="none" d="
      M 660 470 C 520 402 380 420 300 500 C 262 538 246 584 250 628
      C 262 588 288 552 328 522 C 408 462 546 452 664 512 Z"/>
    <!-- thumb loop -->
    <ellipse cx="470" cy="796" rx="62" ry="42" fill="none" stroke="${c.base}" stroke-width="30" transform="rotate(20 470 796)"/>
    <ellipse cx="470" cy="796" rx="62" ry="42" fill="none" stroke="${c.line}" stroke-width="4" transform="rotate(20 470 796)"/>
    <!-- the roll -->
    <circle cx="790" cy="640" r="252" fill="${c.base}"/>
    <circle cx="790" cy="640" r="252" fill="url(#sheen)" stroke="none"/>
    <circle cx="790" cy="640" r="196" fill="none" stroke="${c.dark}" stroke-width="9" opacity=".65"/>
    <circle cx="790" cy="640" r="146" fill="none" stroke="${c.dark}" stroke-width="9" opacity=".5"/>
    <circle cx="790" cy="640" r="100" fill="${c.dark}"/>
    <circle cx="790" cy="640" r="52" fill="${c.line}"/>
  </g>
  ${crown(790, 640, 108, c.mark, 0.95)}`);
}

function headgear(c) {
  return frame(`
  <g stroke="${c.line}" stroke-width="4" stroke-linejoin="round">
    <path fill="${c.base}" d="
      M 600 210 C 790 210 924 336 924 528 L 924 700
      C 924 848 852 950 736 986 L 700 872 C 660 890 540 890 500 872 L 464 986
      C 348 950 276 848 276 700 L 276 528 C 276 336 410 210 600 210 Z"/>
    <path fill="url(#sheen)" stroke="none" d="
      M 600 210 C 790 210 924 336 924 528 L 800 528 C 800 400 720 330 600 330 Z"/>
    <path fill="${c.dark}" d="
      M 600 330 C 706 330 786 400 800 500 L 800 660 C 800 736 750 790 674 806
      L 600 812 L 526 806 C 450 790 400 736 400 660 L 400 500 C 414 400 494 330 600 330 Z"/>
    <path fill="${c.light}" opacity=".45" d="M 276 560 L 400 560 L 400 720 L 276 720 Z"/>
    <path fill="${c.light}" opacity=".45" d="M 924 560 L 800 560 L 800 720 L 924 720 Z"/>
    <path fill="${c.base}" d="M 464 986 C 520 1008 680 1008 736 986 L 712 900 C 660 924 540 924 488 900 Z"/>
    <path fill="none" stroke="${c.trim}" stroke-width="8" opacity=".8" d="M 276 528 C 360 486 840 486 924 528"/>
  </g>
  ${crown(600, 268, 142, c.mark, 0.95)}
  ${patch(600, 950, 168, 52, c.dark, c.trim)}`);
}

function gymBag(c) {
  return frame(`
  <g stroke="${c.line}" stroke-width="4" stroke-linejoin="round">
    <path fill="none" stroke="${c.dark}" stroke-width="18" d="M 300 700 L 214 552 C 196 520 214 486 250 486"/>
    <rect x="230" y="440" width="740" height="380" rx="130" fill="${c.base}"/>
    <rect x="230" y="440" width="740" height="380" rx="130" fill="url(#sheen)" stroke="none"/>
    <path fill="${c.dark}" d="M 230 630 C 300 660 900 660 970 630 L 970 690 C 970 762 912 820 840 820 L 360 820 C 288 820 230 762 230 690 Z"/>
    <rect x="300" y="500" width="230" height="150" rx="26" fill="${c.light}" opacity=".4"/>
    <rect x="300" y="500" width="230" height="150" rx="26" fill="none"/>
    <path fill="none" stroke="${c.trim}" stroke-width="14" stroke-linecap="round" d="
      M 470 452 C 470 330 730 330 730 452"/>
    <rect x="540" y="392" width="120" height="46" rx="16" fill="${c.dark}"/>
    <path fill="none" stroke="${c.trim}" stroke-width="10" opacity=".85" d="M 236 560 C 320 590 880 590 964 560"/>
  </g>
  ${crown(760, 560, 118, c.mark, 0.92)}
  ${patch(415, 575, 158, 52, c.dark, c.trim)}`);
}

/* ------------------------------------------------------------------ */

const JOBS = [
  { file: "apparel-crown-tee-onyx.png", svg: tee(PALETTES.onyx) },
  { file: "apparel-crown-tee-bone.png", svg: tee(PALETTES.bone) },
  { file: "apparel-crown-tee-crimson.png", svg: tee(PALETTES.crimson) },
  { file: "apparel-hoodie-onyx.png", svg: hoodie(PALETTES.onyx) },
  { file: "apparel-hoodie-bone.png", svg: hoodie(PALETTES.bone) },
  { file: "apparel-shorts-crimson.png", svg: shorts(PALETTES.crimson) },
  { file: "apparel-shorts-onyx.png", svg: shorts(PALETTES.onyx) },
  { file: "equip-hand-wraps-crimson.png", svg: wraps(PALETTES.crimson) },
  { file: "equip-hand-wraps-onyx.png", svg: wraps(PALETTES.onyx) },
  { file: "equip-hand-wraps-bone.png", svg: wraps(PALETTES.bone) },
  { file: "equip-headgear-onyx.png", svg: headgear(PALETTES.onyx) },
  { file: "equip-headgear-crimson.png", svg: headgear(PALETTES.crimson) },
  { file: "equip-gym-bag-onyx.png", svg: gymBag(PALETTES.onyx) },
];

for (const job of JOBS) {
  const dest = path.join(OUT, job.file);
  // Trim the canvas back to the artwork so these fill a product tile at the
  // same visual weight as the cut-out glove photography.
  await sharp(Buffer.from(job.svg))
    .trim({ threshold: 2 })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`${job.file.padEnd(38)} ${(fs.statSync(dest).size / 1024).toFixed(0)}kb`);
}
