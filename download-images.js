/**
 * Downloads product images to /images from image-sources.txt
 * Run once: node js/download-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const LIST = path.join(__dirname, 'image-sources.txt');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);

    const request = (fetchUrl) => {
      proto.get(fetchUrl, {
        headers: {
          'User-Agent': 'PCBuilderPro/1.0 (Educational; image download)',
          Accept: 'image/*,*/*'
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          reject(new Error(`HTTP ${res.statusCode} for ${fetchUrl}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      }).on('error', (err) => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

async function main() {
  const lines = fs.readFileSync(LIST, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  let ok = 0;
  let fail = 0;

  for (const line of lines) {
    const [rel, url] = line.split('|');
    if (!rel || !url) continue;

    const dest = path.join(ROOT, rel.replace(/\//g, path.sep));
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log('Skip (exists):', rel);
      ok++;
      continue;
    }

    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 500) throw new Error('File too small');
      console.log('OK:', rel, `(${Math.round(size / 1024)} KB)`);
      ok++;
    } catch (err) {
      console.error('FAIL:', rel, '-', err.message);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} succeeded, ${fail} failed`);
}

main();
