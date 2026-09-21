const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const dir = __dirname;

async function main() {
  const width = 480;
  const height = 716;
  const raw = { width, height, channels: 3 };
  const original = await sharp(path.join(dir, 'mona-lisa-original.jpg')).resize(width, height, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const wink = await sharp(path.join(dir, 'mona-lisa-wink-keyframe.png')).resize(width, height, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const cx = 244, cy = 166, rx = 28, ry = 17;
  const smooth = v => { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); };
  const offsets = [0, 0, 0];
  let count = 0;
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const radius = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (radius > 0.75 && radius < 1) {
        const i = (y * width + x) * 3;
        for (let c = 0; c < 3; c++) offsets[c] += original[i + c] - wink[i + c];
        count++;
      }
    }
  }
  for (let c = 0; c < 3; c++) offsets[c] /= count;
  const closed = Buffer.from(original);
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const radius = Math.hypot((x - cx) / rx, (y - cy) / ry);
      const alpha = 1 - smooth((radius - 0.62) / 0.38);
      const i = (y * width + x) * 3;
      for (let c = 0; c < 3; c++) {
        const corrected = Math.max(0, Math.min(255, wink[i + c] + offsets[c]));
        closed[i + c] = Math.round(original[i + c] * (1 - alpha) + corrected * alpha);
      }
    }
  }
  const amounts = [0, 0.25, 0.65, 1, 0.75, 0.35, 0.1];
  const delay = [3500, 40, 40, 220, 50, 50, 50];
  const frames = amounts.map(amount => {
    const frame = Buffer.alloc(original.length);
    for (let i = 0; i < frame.length; i++) frame[i] = Math.round(original[i] + amount * (closed[i] - original[i]));
    return frame;
  });
  const output = path.join(dir, 'mona-lisa-winking.gif');
  await sharp(Buffer.concat(frames), { raw: { ...raw, height: height * frames.length, pageHeight: height } })
    .gif({ loop: 0, delay, colours: 256, dither: 0.35, effort: 7 }).toFile(output);
  const previews = await Promise.all([0, 2, 3, 5].map(async page => {
    return sharp(output, { page }).extract({ left: 155, top: 100, width: 135, height: 160 }).resize(270, 320).png().toBuffer();
  }));
  await sharp({ create: { width: 1080, height: 320, channels: 3, background: '#000' } })
    .composite(previews.map((input, i) => ({ input, left: i * 270, top: 0 })))
    .png().toFile(path.join(dir, 'mona-lisa-wink-preview.png'));
  const meta = await sharp(output, { animated: true }).metadata();
  const stat = await fs.stat(output);
  console.log(JSON.stringify({ file: output, width: meta.width, height: meta.pageHeight, frames: meta.pages, loop: meta.loop, durationMs: meta.delay.reduce((a,b) => a+b, 0), bytes: stat.size }));
}
main().catch(error => { console.error(error); process.exit(1); });
