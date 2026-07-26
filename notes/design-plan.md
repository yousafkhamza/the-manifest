# The Manifest — design plan

Subject: a real newspaper for one reader's world — cloud infra, k8s ecosystem,
IaC, Python. Audience: DevOps engineer who lives in a terminal. Job of the
page: scan ten beats in under a minute, click through to the source.

## Name
"The Manifest" — double meaning: a k8s/Helm manifest, and a ship's cargo
manifest (things arriving, itemized, dated). Tagline: "All Systems, Reported."

## Palette
- Paper:      #ECE8DF  (cool newsprint, not the warm-cream AI default)
- Ink:        #1B1A17
- Rule:       #8A8577  (hairlines)
- Rust:       #9A3324  (masthead accent, section rules — classic newspaper red, shifted off the terracotta-tell)
- Wire green: #2F6E51  (ticker strip — nod to terminal green, "live wire" feel)
- Card paper: #F6F3EC  (article cards, barely lifted off page)

## Type
- Display (masthead, headlines): "Fraunces" — a serif with ink-trap-like
  texture, more character than Playfair, still readable at newsprint sizes.
- Body: "Source Serif 4" — quiet workhorse for summaries/bylines.
- Utility (dateline, ticker, meta, source tags): "IBM Plex Mono" — the one
  concession to the reader's day job, used sparingly for data-shaped text.

## Layout
Masthead → hairline double-rule → version ticker strip (mono, wire-green
accent, like a stock ticker but for release tags) → sticky section jump
nav → broadsheet sections in a fixed section order (Compute & Cloud,
Orchestration, Infrastructure as Code, Languages & Runtimes) → each topic is
a sub-head with a rule → articles as a dense grid of cards → footer with
archive strip (last 7 editions) + aggregator disclosure.

## Signature element
The **release ticker** — a horizontal wire-green strip under the masthead
showing today's resolved version tags for Kubernetes / Terraform / Python /
Karpenter / Argo CD / Helm / Kustomize, styled like a stock ticker. It's the
one place the page admits it's a DevOps paper and not a generic broadsheet,
and it's real data pulled at collection time, not decoration.

## Self-critique
- Broadsheet-with-hairlines is a known AI default — but the brief explicitly
  asked for "like an e-newspaper," so here it's a choice, not a default.
  Distinctiveness moved into: off-white (not warm cream), rust not terracotta,
  Fraunces not Playfair, and the ticker as the one real signature.
- Cut: numbered "01/02/03" markers — nothing here is a sequence.
- Cut: photo-heavy hero — the ticker is the hero instead, since most days
  won't have a single dominant story across 10 unrelated topics.
