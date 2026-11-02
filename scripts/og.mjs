// Generates the 1200x630 Open Graph images referenced by each page.
// Add an entry here when you add a page, and point its og:image at the file.
import { chromium } from 'playwright';
import { start } from './server.mjs';

const images = [
  { file: 'og-home.png',    title: 'Day-2 tools for VMs on Kubernetes.', sub: 'KVTools · KVTop · KVOvn-topo' },
  { file: 'og-rvtools.png', title: 'An RVTools equivalent for KubeVirt.', sub: 'KVTools · Harvester · OpenShift Virtualization' },
];

const srv = await start(8812);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('http://localhost:8812/__og.html', { waitUntil: 'networkidle' });
for (const { file, title, sub } of images) {
  await page.evaluate(([t, s]) => { document.getElementById('t').textContent = t; document.getElementById('s').textContent = s; }, [title, sub]);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/img/${file}` });
  console.log('wrote public/img/' + file);
}
await browser.close(); srv.close();
