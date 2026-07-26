# The Manifest — All Systems, Reported

A daily, self-publishing e-newspaper for cloud & infrastructure news:
**AWS · Azure · GCP · Kubernetes · Terraform · Python · Go · Rust · JavaScript / Node.js.**

Every morning a GitHub Action pulls each topic's official RSS/Atom feed,
keeps the headline + the publisher's own short summary + a thumbnail + a
link back to the source, and republishes the front page. No article body
is ever copied — this is a gathering place that gets you to the real story,
not a replacement for it.

## How it works

```
scripts/collect.mjs   → fetches every feed in scripts/topics.mjs, dedupes,
                         keeps the newest N per topic, resolves a release-
                         version "ticker" from the GitHub API, writes:
                           public/data/latest.json
                           public/data/editions/YYYY-MM-DD.json
                           public/data/index.json   (rolling 7-day archive)

.github/workflows/
  collect.yml          → cron, daily 05:00 UTC: runs the collector,
                          commits the new edition to main
  deploy.yml           → on every push to main: builds with Vite and
                          deploys dist/ to GitHub Pages

src/main.js            → fetches public/data/latest.json (or an archived
                          edition) client-side and renders the front page
```

The collector commit triggers the deploy workflow automatically, so a
single daily cron run publishes a new edition end to end — no manual step.

## Why this is copyright-safe

- Feeds are official, publisher-run syndication feeds — that's what they're
  *for*.
- We store the feed's own title + short description + its own thumbnail
  URL, nothing scraped from the article body.
- **Images**: when a feed provides its own thumbnail, we use it (it's
  licensed for that use). When it doesn't, the site falls back to an
  **original cover illustration** generated per topic in `src/main.js`
  (`coverArt()`) — abstract geometric motifs drawn in code, not sourced
  from Google Images or anywhere else. Every article always has a picture,
  and none of them carry a rights question.
- Every card shows the picture and summary first, then ends with a clearly
  visible `Read at <source domain> ↗` link — so it's obvious the click
  takes you off-site to the original publisher.
- Every story links out to the original source; the site never tries to
  stand in for it.

## Getting it running

1. **Push this repo to GitHub** (repo name becomes part of the Pages URL
   unless you use a custom domain).
2. **Settings → Pages → Source: GitHub Actions.**
3. **Settings → Actions → General → Workflow permissions:** set to
   *"Read and write permissions"* so `collect.yml` can commit the daily
   edition back to `main`.
4. Run **Collect daily edition** once manually (Actions tab →
   *Collect daily edition* → *Run workflow*) to generate the first
   edition — it'll auto-commit and that push will trigger the deploy.
5. From then on, it runs itself every day at 05:00 UTC.

## Local development

```bash
npm install
npm run collect   # populate public/data with a real edition
npm run dev        # http://localhost:5173
```

`npm run collect` hits every RSS feed and the GitHub API live, so it needs
network access; it's the same script the daily workflow runs.

## Customizing topics

Edit `scripts/topics.mjs`:
- Add/remove a topic by editing the `TOPICS` array (each needs an `id`,
  `name`, `section`, and one or more official `feeds`).
- Also add the topic to `TOPIC_META` in `src/main.js` — give it a `color`
  and a `motif` (one of `arcs`, `diamonds`, `pennants`, `hexgrid`, `stack`,
  `braid`, `chevron`, `gear`, `braces`, or add a new case to
  `motifShapes()`) so it gets its own original cover illustration and
  shows up in the section nav.
- `ARTICLES_PER_TOPIC` controls how many stories run per topic per day.
- `RETAIN_DAYS` controls the archive window (defaults to 7).
- `VERSION_TICKER` controls which tools show up in the release-ticker strip
  under the masthead.

## License

MIT — see [LICENSE](./LICENSE).
