// Prints the résumé pages from the static build to PDFs in public/. Run after `next build`: npm run cv
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'out');
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pages = { '/curriculo/': 'eduardo-santarosa-curriculo.pdf', '/en/resume/': 'eduardo-santarosa-resume.pdf' };
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };

if (!fs.existsSync(out)) throw new Error('Run `npm run build` first.');

// The export uses absolute /_next/ paths, so it has to be served over http, not file://.
const server = http.createServer((req, res) => {
  let file = path.join(out, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(out)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// A throwaway profile keeps headless Chrome from attaching to a running Chrome and never exiting.
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-chrome-'));
try {
  for (const [route, name] of Object.entries(pages)) {
    const target = path.join(root, 'public', name);
    // Async on purpose: a sync spawn would block this process's own http server.
    await promisify(execFile)(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=5000', `--print-to-pdf=${target}`, base + route], { timeout: 60_000 });
    fs.copyFileSync(target, path.join(out, name));
    console.log(`${route} → public/${name}`);
  }
} finally {
  server.close();
  fs.rmSync(profile, { recursive: true, force: true });
}
