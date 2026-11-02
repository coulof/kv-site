// Renders every page in sitemap.xml at phone and desktop width, saves
// full-page screenshots to .shots/, and fails on:
//   - horizontal overflow at 390px
//   - missing <title>, meta description, canonical, or not exactly one <h1>
//   - internal links, images, fonts or stylesheets that 404
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { start } from './server.mjs';

const PORT = 8811, ORIGIN = `http://localhost:${PORT}`;
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);

const srv = await start(PORT);
const browser = await chromium.launch();
await mkdir('.shots', { recursive: true });
const errors = [];

for (const path of paths) {
  const slug = path === '/' ? 'home' : path.replace(/\//g, '');
  for (const [label, viewport] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1366, height: 900 }]]) {
    const page = await browser.newPage({ viewport });
    page.on('response', r => { if (r.url().startsWith(ORIGIN) && r.status() >= 400) errors.push(`${path} [${label}] ${r.status()} ${r.url()}`); });
    await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `.shots/${slug}-${label}.png`, fullPage: true });
    if (label === 'mobile') {
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > viewport.width) errors.push(`${path} overflows on mobile: scrollWidth ${sw}`);
      const seo = await page.evaluate(() => ({
        title: document.title,
        desc: document.querySelector('meta[name=description]')?.content,
        canonical: document.querySelector('link[rel=canonical]')?.href,
        h1: document.querySelectorAll('h1').length,
        links: [...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith(location.origin)),
      }));
      if (!seo.title) errors.push(`${path} no <title>`);
      if (!seo.desc) errors.push(`${path} no meta description`);
      else if (seo.desc.length > 170) errors.push(`${path} meta description ${seo.desc.length} chars (keep under ~160)`);
      if (!seo.canonical) errors.push(`${path} no canonical`);
      if (seo.h1 !== 1) errors.push(`${path} has ${seo.h1} <h1>`);
      for (const href of new Set(seo.links.map(h => h.split('#')[0]))) {
        const r = await fetch(href);
        if (!r.ok) errors.push(`${path} broken link ${href} (${r.status})`);
      }
    }
    await page.close();
  }
}
await browser.close(); srv.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`ok: ${paths.length} pages, screenshots in .shots/`);
