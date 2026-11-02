# KV* tools site

Website for [KVTools](https://github.com/coulof/kvtools), [KVTop](https://github.com/coulof/kvtop)
and [KVOvn-topo](https://github.com/coulof/kvovn-topo). Static files on Cloudflare Workers.

```sh
mise run setup    # npm install + Playwright Chromium (once)
mise run serve    # wrangler dev on http://localhost:8787
mise run check    # overflow, SEO tags, broken links; screenshots in .shots/
mise run deploy   # check, then wrangler deploy
```

Read [AGENTS.md](AGENTS.md) before changing copy or styles.

MIT licensed, see [LICENSE](LICENSE).
