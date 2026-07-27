import "./style.css";

// Section grouping + display order — mirrors scripts/topics.mjs but kept
// separate since the frontend has no build-time access to that Node module.
const SECTION_ORDER = ["Compute & Cloud", "Orchestration", "Infrastructure as Code", "Languages & Runtimes"];

const TOPIC_META = {
  aws: { name: "Amazon Web Services", section: "Compute & Cloud", color: "#9a3324", motif: "arcs" },
  azure: { name: "Microsoft Azure", section: "Compute & Cloud", color: "#33506b", motif: "diamonds" },
  gcp: { name: "Google Cloud", section: "Compute & Cloud", color: "#2f6e51", motif: "pennants" },
  kubernetes: { name: "Kubernetes", section: "Orchestration", color: "#1b1a17", motif: "hexgrid" },
  terraform: { name: "Terraform", section: "Infrastructure as Code", color: "#a8791e", motif: "stack" },
  python: { name: "Python", section: "Languages & Runtimes", color: "#6b3f5c", motif: "braid" },
  go: { name: "Go", section: "Languages & Runtimes", color: "#3e7c7c", motif: "chevron" },
  rust: { name: "Rust", section: "Languages & Runtimes", color: "#8b5a2b", motif: "gear" },
  javascript: { name: "JavaScript / Node.js", section: "Languages & Runtimes", color: "#c9a227", motif: "braces" },
};

const TOPIC_ORDER = Object.keys(TOPIC_META);

// Fixed at launch, like a real newspaper's "Est." line — this never
// changes with the daily edition date.
const FOUNDED_DATE = "July 26, 2026";
const FOUNDER = "Yousaf Hamza";

const app = document.getElementById("app");
const base = import.meta.env.BASE_URL;

// ---------- Original per-topic cover art ----------
// Used only as a fallback when a feed doesn't supply its own thumbnail.
// These are drawn procedurally with abstract geometric motifs — nothing
// scraped or copied from anywhere — so there's never a rights question.

function motifShapes(motif, color) {
  switch (motif) {
    case "arcs":
      return `
        <circle cx="60" cy="140" r="26" fill="none" stroke="${color}" stroke-width="4" opacity="0.85"/>
        <circle cx="60" cy="140" r="46" fill="none" stroke="${color}" stroke-width="4" opacity="0.55"/>
        <circle cx="60" cy="140" r="66" fill="none" stroke="${color}" stroke-width="4" opacity="0.3"/>`;
    case "diamonds":
      return Array.from({ length: 4 })
        .map((_, i) => `<rect x="${40 + i * 55}" y="60" width="46" height="46" fill="none" stroke="${color}" stroke-width="4" opacity="${0.85 - i * 0.15}" transform="rotate(45 ${63 + i * 55} 83)"/>`)
        .join("");
    case "pennants":
      return Array.from({ length: 5 })
        .map((_, i) => `<polygon points="${30 + i * 55},150 ${30 + i * 55},70 ${65 + i * 55},110" fill="${color}" opacity="${0.9 - i * 0.14}"/>`)
        .join("");
    case "hexgrid":
      return Array.from({ length: 5 })
        .map((_, i) => {
          const x = 50 + (i % 3) * 90;
          const y = 55 + Math.floor(i / 3) * 80;
          return `<polygon points="${x},${y - 24} ${x + 21},${y - 12} ${x + 21},${y + 12} ${x},${y + 24} ${x - 21},${y + 12} ${x - 21},${y - 12}" fill="none" stroke="${color}" stroke-width="4" opacity="0.75"/>`;
        })
        .join("") + `<line x1="71" y1="55" x2="140" y2="55" stroke="${color}" stroke-width="3" opacity="0.4"/>`;
    case "stack":
      return Array.from({ length: 4 })
        .map((_, i) => `<polygon points="${60},${140 - i * 26} ${160},${125 - i * 26} ${260},${140 - i * 26} ${160},${155 - i * 26}" fill="none" stroke="${color}" stroke-width="4" opacity="${0.9 - i * 0.15}"/>`)
        .join("");
    case "braid":
      return `<path d="M40 150 C 90 60, 150 220, 200 90 S 280 150, 280 90" fill="none" stroke="${color}" stroke-width="6" opacity="0.8"/>
        <path d="M40 90 C 90 180, 150 20, 200 150 S 280 90, 280 150" fill="none" stroke="${color}" stroke-width="6" opacity="0.4"/>`;
    case "chevron":
      return Array.from({ length: 4 })
        .map((_, i) => `<polyline points="${40 + i * 55},170 ${75 + i * 55},110 ${40 + i * 55},50" fill="none" stroke="${color}" stroke-width="6" opacity="${0.9 - i * 0.15}"/>`)
        .join("");
    case "gear": {
      const teeth = 10;
      const cx = 160, cy = 108, rOuter = 58, rInner = 44, rHub = 20;
      let pts = "";
      for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = (Math.PI * i) / teeth;
        pts += `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} `;
      }
      return `<polygon points="${pts}" fill="none" stroke="${color}" stroke-width="4" opacity="0.75"/>
        <circle cx="${cx}" cy="${cy}" r="${rHub}" fill="none" stroke="${color}" stroke-width="4" opacity="0.75"/>`;
    }
    case "braces":
      return `<text x="160" y="145" font-family="Georgia, serif" font-size="150" font-weight="700" fill="${color}" text-anchor="middle" opacity="0.85">{ }</text>`;
    default:
      return `<circle cx="160" cy="90" r="40" fill="none" stroke="${color}" stroke-width="4"/>`;
  }
}

const coverArtCache = new Map();

function coverArt(topicId) {
  if (coverArtCache.has(topicId)) return coverArtCache.get(topicId);
  const meta = TOPIC_META[topicId] || { color: "#4a473f", motif: "default", name: topicId };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
    <rect width="320" height="180" fill="#f6f3ec"/>
    <rect x="2" y="2" width="316" height="176" fill="none" stroke="${meta.color}" stroke-width="3"/>
    ${motifShapes(meta.motif, meta.color)}
    <text x="16" y="166" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="1" fill="${meta.color}">${(meta.name || topicId).toUpperCase()}</text>
  </svg>`;
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  coverArtCache.set(topicId, uri);
  return uri;
}

// ---------- Helpers ----------

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffH = Math.max(0, Math.round((Date.now() - then) / 3600000));
  if (diffH < 1) return "just in";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}d ago`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function truncate(text, max = 170) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

// ---------- Routing ----------
// #/                                     -> latest edition, list view
// #/edition/<date>                       -> archived edition, list view
// #/article/<date>/<topicId>/<encLink>   -> a single story's own page

function articleHref(date, topicId, link) {
  return `#/article/${encodeURIComponent(date)}/${encodeURIComponent(topicId)}/${encodeURIComponent(link)}`;
}

function editionHref(date) {
  return `#/edition/${encodeURIComponent(date)}`;
}

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "edition" && parts[1]) {
    return { view: "list", date: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === "article" && parts[1] && parts[2] && parts[3]) {
    return {
      view: "article",
      date: decodeURIComponent(parts[1]),
      topicId: decodeURIComponent(parts[2]),
      link: decodeURIComponent(parts[3]),
    };
  }
  return { view: "list", date: null };
}

const editionCache = new Map();

async function getEdition(date) {
  const key = date || "latest";
  if (editionCache.has(key)) return editionCache.get(key);
  const path = date ? `${base}data/editions/${date}.json` : `${base}data/latest.json`;
  const edition = await fetchJSON(path);
  editionCache.set(key, edition);
  editionCache.set(edition.date, edition);
  return edition;
}

// ---------- Ticker ----------

function renderTicker(ticker) {
  if (!ticker?.length) return "";
  const items = ticker
    .map((t) => `<span class="ticker-item"><b>${t.label}</b> ${t.version ? `<span>${t.version}</span>` : '<span class="dim">—</span>'}</span>`)
    .join("");
  return `<div class="ticker"><div class="ticker-inner">${items}${items}</div></div>`;
}

// ---------- List view ----------
// The whole card is one internal link to the story's own page — no
// external redirect happens from the front page itself.

function renderCard(article, topicId, editionDate) {
  const fallback = coverArt(topicId);
  const img = article.image || fallback;
  const href = articleHref(editionDate, topicId, article.link);
  const newBadge = article.isNew ? `<span class="card-new-badge">New</span>` : "";

  return `
    <a class="card" href="${href}">
      <div class="card-thumb-wrap">
        <img class="card-thumb" src="${img}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'" />
        ${newBadge}
      </div>
      <div class="card-body">
        <h4>${article.title}</h4>
        <p class="card-summary">${truncate(article.summary, 170)}</p>
        <div class="card-footer">
          <span class="card-time">${timeAgo(article.published)}</span>
          <span class="card-more">Full story →</span>
        </div>
      </div>
    </a>`;
}

function renderTopicBlock(topicId, articles, editionDate) {
  const meta = TOPIC_META[topicId];
  if (!meta) return "";
  const body = articles?.length
    ? `<div class="card-grid">${articles.map((a) => renderCard(a, topicId, editionDate)).join("")}</div>`
    : `<p class="topic-empty">No fresh dispatches today.</p>`;
  return `
    <div class="topic-block" id="topic-${topicId}">
      <h3>${meta.name}</h3>
      ${body}
    </div>`;
}

function renderSections(topics, editionDate) {
  return SECTION_ORDER.map((section) => {
    const topicIds = TOPIC_ORDER.filter((id) => TOPIC_META[id].section === section);
    return `
      <section class="section-group" id="section-${section.replace(/\s+/g, "-").toLowerCase()}">
        <h2>${section}</h2>
        ${topicIds.map((id) => renderTopicBlock(id, topics[id], editionDate)).join("")}
      </section>`;
  }).join("");
}

function renderNav() {
  return `<nav class="section-nav" aria-label="Jump to topic">
    ${TOPIC_ORDER.map((id) => `<a href="#topic-${id}">${TOPIC_META[id].name}</a>`).join("")}
  </nav>`;
}

function renderArchive(index, activeDate) {
  const dates = index?.dates || [];
  if (!dates.length) return "";
  const pills = dates
    .map((d) => `<a href="${d === index.dates[0] ? "#/" : editionHref(d)}" aria-current="${d === activeDate}">${d}</a>`)
    .join("");
  return `<div class="archive"><h5>Past editions</h5><div class="archive-pills">${pills}</div></div>`;
}

function renderFooter() {
  return `<footer class="masthead-footer">
    <span>The Manifest is an automated digest. Headlines, summaries, and thumbnails are pulled from each publisher's own syndication feed (or an original illustration when none is provided); every story links back to the original source.</span>
    <a href="https://github.com/yousafkhamza" target="_blank" rel="noopener noreferrer">github.com/yousafkhamza</a>
  </footer>`;
}

function renderMasthead(edition, index, ticker = true) {
  const totalTopics = Object.values(edition.topics || {}).filter((a) => a?.length).length;
  return `
    <header class="masthead">
      <a class="masthead-link" href="#/">
        <p class="kicker">All Systems, Reported</p>
        <h1>The Manifest</h1>
        <p class="tagline">A daily front page for cloud &amp; infrastructure</p>
        <p class="masthead-est">Est. ${FOUNDED_DATE} · ${FOUNDER}</p>
      </a>
      <div class="dateline">
        <span>${formatDate(edition.date)}</span>
        <span>Edition No. ${index?.editionNumber ?? "—"} · ${edition.totalArticles ?? 0} dispatches · ${totalTopics} beats reporting</span>
      </div>
      ${ticker ? renderTicker(edition.ticker) : ""}
    </header>`;
}

// ---------- Article (detail) view ----------

function renderArticleView(edition, article, topicId) {
  const meta = TOPIC_META[topicId] || { name: topicId, color: "#4a473f" };
  const fallback = coverArt(topicId);
  const img = article.image || fallback;
  const host = hostnameOf(article.link) || article.source || "the source";

  app.innerHTML = `
    ${renderMasthead(edition, cachedIndex, false)}
    <main class="article-view">
      <a class="back-link" href="${editionHref(edition.date)}">← Back to the front page</a>
      <p class="article-topic-tag" style="color:${meta.color}; border-color:${meta.color}">${meta.name}</p>
      ${article.isNew ? '<span class="article-new-tag">New since yesterday</span>' : ""}
      <h1 class="article-title">${article.title}</h1>
      <p class="article-byline">${[article.source, formatDateTime(article.published)].filter(Boolean).join(" · ")}</p>
      <img class="article-image" src="${img}" alt="" onerror="this.onerror=null;this.src='${fallback}'" />
      <p class="article-summary">${article.summary || "No summary was provided for this story."}</p>
      <a class="article-source-cta" href="${article.link}" target="_blank" rel="noopener noreferrer">
        Read the full story at ${host} ↗
      </a>
      <p class="article-disclosure">This is the publisher's own summary from their syndication feed, not the full article. The complete story lives at the link above.</p>
    </main>
  `;
  window.scrollTo(0, 0);
}

// ---------- Full edition (list) view ----------

async function renderListView(edition, index) {
  app.innerHTML = `
    ${renderMasthead(edition, index)}
    ${renderNav()}
    <main>${renderSections(edition.topics || {}, edition.date)}</main>
    ${renderArchive(index, edition.date)}
    ${renderFooter()}
  `;
}

// ---------- Router ----------

let cachedIndex = null;

async function router() {
  const route = parseRoute();
  try {
    if (route.view === "article") {
      const edition = await getEdition(route.date);
      const articles = edition.topics?.[route.topicId] || [];
      const article = articles.find((a) => a.link === route.link);
      if (!article) {
        app.innerHTML = `
          ${renderMasthead(edition, cachedIndex, false)}
          <main class="article-view">
            <a class="back-link" href="${editionHref(edition.date)}">← Back to the front page</a>
            <p class="loading-note">That story isn't in this edition anymore — it may have rolled out of the archive window.</p>
          </main>`;
        return;
      }
      renderArticleView(edition, article, route.topicId);
      return;
    }
    const edition = await getEdition(route.date);
    await renderListView(edition, cachedIndex);
  } catch (err) {
    app.innerHTML = `<p class="loading-note">Couldn't load that page (${err.message}).</p>`;
  }
}

async function init() {
  cachedIndex = await fetchJSON(`${base}data/index.json`).catch(() => null);
  window.addEventListener("hashchange", router);
  router();
}

init();
