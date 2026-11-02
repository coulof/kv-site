# AGENTS.md: KV* tools website

Static marketing and docs site for three open-source tools by Florian Coulombel (GonZo):
KVTools, KVTop and KVOvn-topo. Served from Cloudflare Workers static assets. No framework,
no build step, no client-side JS beyond the copy buttons.

## Layout

```
public/                      everything that gets deployed
  index.html                 home: the three tools
  rvtools-alternative-kubevirt/index.html   landing page for "RVTools for KubeVirt" searches
  404.html                   uses absolute /style.css (served at any depth)
  style.css                  the whole design system, one file (SUSE & SUSE Mono via Google Fonts CDN)
  img/                       logo marks (SVG), screenshots (WebP), vhs demos (WebM), og-*.png
  robots.txt  sitemap.xml  llms.txt
scripts/
  check.mjs                  renders every sitemap page at 390px and 1366px, fails on overflow,
                             missing SEO tags, or broken internal links/assets; screenshots in .shots/
  server.mjs                 static server used by check (mirrors Workers trailing-slash rules)
  optimize-image.py          README screenshot -> cropped 1600px WebP
wrangler.jsonc               assets-only Worker, html_handling auto-trailing-slash
```

Commands (`mise tasks` lists them): `mise run setup` (npm i + Playwright Chromium, once), `mise run check`, `mise run serve`, `mise run deploy` (runs check first),
`mise run cf:login`. The npm scripts still work.

## Source of truth for facts

Every claim on the site must come from the upstream repos: README, docs/, release assets, or
running the released binary. Do not invent features, numbers, users, benchmarks or quotes.
If a fact is missing, leave a visible `[TODO: ...]` in an HTML comment and say so.

- KVTools: github.com/coulof/kvtools (v0.1.0, MIT). 13 sheets, 16 `HLTH-*` rules.
- KVTop: github.com/coulof/kvtop (v0.2.0, MIT). TUI, JSON CLI (`schema: kvtop/v1`), MCP server.
- KVOvn-topo: github.com/coulof/kvovn-topo (v0.1.0 pre-release, **no LICENSE file yet**).
- Install via Homebrew: `brew install coulof/tap/<kvtools|kvtop|kvovn-topo>` (formulae in
  github.com/coulof/homebrew-tap). KVOvn-topo: macOS arm64 and Linux amd64 only.

Known gaps the copy must not paper over:
- `kvtop --replay testdata/` and `kvovn-topo --fixture` need a clone of the repo; fixtures are not
  embedded in the released binaries (`kvovn-topo --fixture` panics outside the repo in v0.1.0).
- `kvtop completion` is on main but not in v0.2.0.
- KVTools output is not parseable by tools that read RVTools files. The mapping is for people.

## Naming

- Display names, exactly: **KVTools**, **KVTop**, **KVOvn-topo**, family label **KV\***.
- Binaries, commands, repo names, URLs and anchors stay lowercase: `kvtools`, `kvtop`,
  `kvovn-topo`, `#kvovn-topo`, `coulof/kvovn-topo`.
- "RVTools" is a third-party trademark: use it descriptively ("an RVTools equivalent"), never in
  a domain, logo or page slug prefix. Keep the footer disclaimer.

## Writing rules (no-ai-slop)

Voice: first person, dry, specific, written by an engineer for ops people. Apply the
no-ai-slop skill to every copy change. In particular:

- No "not X, it's Y" / "X, not Y" contrasts. State Y.
- No self-answered questions ("Several clusters? ..."), colon reveals, punchline endings,
  "fill the gap", "game changer", "seamless", "robust", "leverage", "powerful".
- No em dashes in body copy or titles. Use a period, comma or ` | ` in `<title>`.
- Tools don't "know", "think" or "carry habits". They read, scrape, export, run.
- Every sentence must fail the portability test: if it could describe another product, cut it
  or replace it with a command, a rule ID, a number or a mechanism.
- Numbers and commands come from the repos (see above). No invented stats.

## Visual system (derived from the logos)

- Colours: cobalt `#2453FF` (headings, outlines, the full-width band), deep `#1638C9` (hover,
  code text), wash `#EEF2FF`, ink `#0F1633`, ink-2 `#4B5373`, orange `#FE7C3F`.
- **Orange is never text.** It marks the one highlighted thing: the KVTop spike, the hovered tree
  node (row outline, connector and dot), the square behind a screenshot. Orange on white is 2.6:1 and fails contrast.
- Stroke `2.5px`, radius `12px`, round joins: the logos' outline weight. Use outlines before fills.
- Motifs, use sparingly: the seven-sided outline (hero, band), the tree with nodes (the three
  questions), the offset orange square (screenshots), the small blue block (bullets).
- Type: SUSE 400/600/700/800 for everything, SUSE Mono 400/500 for code and labels.
- No gradients, glass, drop shadows, emoji, icon grids, stock illustrations, or fake terminals.
  Screenshots are real captures from the repos (`scripts/optimize-image.py`).

## Page rules (SEO and quality)

Each page has: one `<h1>`; `<title>` under ~65 chars in the form `Topic | KVTools`;
meta description under ~160 chars; canonical URL; `og:*` and `twitter:card` with its own
`og-*.png`; JSON-LD (`SoftwareApplication` for tools, `FAQPage` only when the page has visible
Q&A). `<img>` always has `width`, `height`, `alt`, and `loading="lazy"` below the fold.

When you add a page:
1. Create `public/<slug>/index.html` (copy the header/footer from an existing page, links relative).
2. Add it to `sitemap.xml` and `llms.txt`.
3. Add its own 1200x630 `public/img/og-<slug>.png` (made by hand, no generator script).
4. Run `mise run check`. It must pass, and look at `.shots/*-mobile.png` yourself.

Pages target one search intent each. Planned, in order:
1. `/kubevirt-vm-monitoring-without-prometheus/`: KVTop.
2. `/kube-ovn-topology-kubectl-ko-alternative/`: KVOvn-topo, links the "Following a Packet
   Through OVN" post.
3. `/kubevirt-mcp-server/`: KVTop + KVOvn-topo MCP tools, prompts from `docs/mcp-prompts.md`.

## Before the first deploy

- Replace every `SITE.example` (HTML, robots.txt, sitemap.xml, llms.txt) with the real domain.
- Blog links point at https://lafabrique.ai/blog/. Point "Following a Packet Through OVN" at the post URL itself.
- Resolve the footer `CONFIRM` comment (personal projects vs SUSE).
- Push the homebrew-tap branch, or the `brew install` lines on the site are wrong.
- Add a LICENSE to kvovn-topo.

## Preview on claude.ai

The claude.ai artifact preview cannot resolve directory URLs, so a preview copy rewrites
`rvtools-alternative-kubevirt/` to `rvtools-alternative-kubevirt/index.html` and `../#x` to
`../index.html#x`. Never commit those rewrites; the deployed site uses clean URLs.
