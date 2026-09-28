// Собирает www/ для Capacitor: копирует приложение, кладёт Leaflet локально (без CDN).
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', 'www'), root = path.join(__dirname, '..');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, 'vendor'), { recursive: true });
for (const d of ['css', 'js', 'assets']) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });
fs.copyFileSync(path.join(root, 'manifest.webmanifest'), path.join(out, 'manifest.webmanifest'));
const leaf = path.join(root, 'node_modules', 'leaflet', 'dist');
if (fs.existsSync(leaf)) fs.cpSync(leaf, path.join(out, 'vendor', 'leaflet'), { recursive: true });
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css', 'vendor/leaflet/leaflet.css')
  .replace('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js', 'vendor/leaflet/leaflet.js');
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('www/ готова');
