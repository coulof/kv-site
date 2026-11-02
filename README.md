# KV* tools site

Website for [KVTools](https://github.com/coulof/kvtools), [KVTop](https://github.com/coulof/kvtop)
and [KVOvn-topo](https://github.com/coulof/kvovn-topo). Static files on Cloudflare Workers.

```sh
npm i
npx playwright install chromium   # once, for npm run check / og
npm run dev                       # wrangler dev on http://localhost:8787
npm run check                     # overflow, SEO tags, broken links; screenshots in .shots/
npm run og                        # regenerate public/img/og-*.png
npm run deploy                    # check, then wrangler deploy
```

Read [AGENTS.md](AGENTS.md) before changing copy or styles.
