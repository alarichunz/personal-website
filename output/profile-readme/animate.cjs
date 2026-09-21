const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const source = process.argv[2] || path.join(__dirname, 'leonardo-aerial-screw.png');
  const stem = path.parse(source).name;
  const { data: art, info } = await sharp(source).resize({ width: 640 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const paper = Buffer.alloc(art.length);
  const thresholds = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const grain = (((x * 73856093 ^ y * 19349663) >>> 0) % 101) / 100 - 0.5;
      const tone = 1.2 * Math.sin(x / 131) * Math.cos(y / 93) + grain * 2;
      paper[p * channels] = Math.round(246 + tone);
      paper[p * channels + 1] = Math.round(233 + tone);
      paper[p * channels + 2] = Math.round(207 + tone);
      thresholds[p] = 0.24 * (x / width) + 0.76 * (y / height) + 0.025 * Math.sin(x / 27) * Math.sin(y / 19);
    }
  }
  const frames = [Buffer.from(art)];
  const delays = [2500];
  const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  function addFrame(progress, duration, fade = false) {
    const frame = Buffer.alloc(art.length);
    for (let p = 0; p < width * height; p++) {
      const opacity = fade ? progress : smooth((progress * 1.22 - thresholds[p]) / 0.20);
      for (let c = 0; c < channels; c++) {
        const i = p * channels + c;
        frame[i] = Math.round(paper[i] + (art[i] - paper[i]) * opacity);
      }
    }
    frames.push(frame);
    delays.push(duration);
  }
  for (let i = 1; i <= 12; i++) addFrame(1 - smooth(i / 12), 100, true);
  delays[delays.length - 1] = 200;
  for (let i = 1; i <= 48; i++) addFrame(i / 48, 100);
  const output = path.join(__dirname, `${stem}.gif`);
  await sharp(Buffer.concat(frames), { raw: { width, height: height * frames.length, channels, pageHeight: height } })
    .gif({ loop: 0, delay: delays, colours: 32, dither: 0, effort: 7 })
    .toFile(output);
  const metadata = await sharp(output, { animated: true }).metadata();
  const stat = await fs.stat(output);
  console.log(JSON.stringify({ file: output, width: metadata.width, height: metadata.pageHeight, frames: metadata.pages, loop: metadata.loop, durationMs: metadata.delay.reduce((a,b) => a+b, 0), bytes: stat.size }));
  // A contact sheet for checking the finished frame, fade, and reveal.
  const selected = [0, 8, 15, 27, 41, 60];
  const tiles = await Promise.all(selected.map(i => sharp(frames[i], { raw: { width, height, channels } }).resize(320).png().toBuffer()));
  await sharp({ create: { width: 960, height: 428, channels: 3, background: '#f6e9cf' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % 3) * 320, top: Math.floor(i / 3) * 214 })))
    .png().toFile(path.join(__dirname, `${stem}-animation-preview.png`));
}
main().catch(error => { console.error(error); process.exit(1); });
