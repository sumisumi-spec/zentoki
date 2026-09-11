// Copies the web app into www/ for Capacitor. The web app itself lives at the repo root (GitHub Pages serves it directly).
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
const out = 'www';
rmSync(out, { recursive: true, force: true }); mkdirSync(out);
for (const f of ['index.html', 'sw.js', 'manifest.webmanifest', 'privacy.html', 'thanks.html', 'tokushoho.html', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og.png', 'og.svg']) {
  if (existsSync(f)) cpSync(f, `${out}/${f}`);
}
console.log('www/ ready');
