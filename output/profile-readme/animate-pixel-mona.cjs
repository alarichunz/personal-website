const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
  const source = path.join(__dirname, 'mona-lisa-pixel-sprites.png');
  const meta = await sharp(source).metadata();
  const half = Math.floor(meta.width / 2);
  const width = 96, height = 144;
  const base = await sharp(source).extract({ left: 0, top: 0, width: half, height: meta.height }).resize(width, height, { kernel: 'nearest', fit: 'fill' }).removeAlpha().raw().toBuffer();
  const wink = await sharp(source).extract({ left: half, top: 0, width: half, height: meta.height }).resize(width, height, { kernel: 'nearest', fit: 'fill' }).removeAlpha().raw().toBuffer();
  const closed = Buffer.from(base);
  for (let y = 29; y <= 33; y++) {
    for (let x = 44; x <= 54; x++) {
      const i = (y * width + x) * 3;
      for (let c = 0; c < 3; c++) closed[i + c] = wink[i + c];
    }
  }
  const frames = await Promise.all([base, closed].map(data => sharp(data, { raw: { width, height, channels: 3 } }).resize(width * 3, height * 3, { kernel: 'nearest' }).raw().toBuffer()));
  const output = path.join(__dirname, 'mona-lisa-pixel-wink.gif');
  await sharp(Buffer.concat(frames), { raw: { width: width * 3, height: height * 3 * 2, channels: 3, pageHeight: height * 3 } })
    .gif({ loop: 0, delay: [3400, 220], colours: 64, dither: 0, effort: 7 }).toFile(output);
  const preview = await Promise.all([0, 1].map(page => sharp(output, { page }).png().toBuffer()));
  await sharp({ create: { width: 576, height: 432, channels: 3, background: '#000' } }).composite(preview.map((input, i) => ({ input, top: 0, left: 288 * i }))).png().toFile(path.join(__dirname, 'mona-lisa-pixel-preview.png'));
  const info = await sharp(output, { animated: true }).metadata();
  console.log(JSON.stringify({ output, width: info.width, height: info.pageHeight, frames: info.pages, loop: info.loop, delay: info.delay, bytes: (await fs.stat(output)).size }));
}
main().catch(error => { console.error(error); process.exit(1); });
