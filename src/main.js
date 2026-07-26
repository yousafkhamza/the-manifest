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

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function renderTicker(ticker) {
  if (!ticker?.length) return "";
  const items = ticker
    .map((t) => `<span class="ticker-item"><b>${t.label}</b> ${t.version ? `<span>${t.version}</span>` : '<span class="dim">—</span>'}</span>`)
    .join("");
  // duplicate the strip so the marquee loop is seamless
  return `<div class="ticker"><div class="ticker-inner">${items}${items}</div></div>`;
}

// ---------- Cards ----------
// Layout order per the brief: picture + headline + summary read first,
// then a clearly visible source link at the end of the card so it's obvious
// where the story lives and that the click is an outbound redirect.

function renderCard(article, topicId) {
  const fallback = coverArt(topicId);
  const img = article.image || fallback;
  const host = hostnameOf(article.link) || article.source || "source";

  return `
    <article class="card">
      <a class="card-thumb-link" href="${article.link}" target="_blank" rel="noopener noreferrer" tabindex="-1">
        <img class="card-thumb" src="${img}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'" />
      </a>
      <div class="card-body">
        <h4><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h4>
        <p class="card-summary">${article.summary || ""}</p>
        <div class="card-footer">
          <span class="card-time">${timeAgo(article.published)}</span>
          <a class="card-source" href="${article.link}" target="_blank" rel="noopener noreferrer">Read at ${host} ↗</a>
        </div>
      </div>
    </article>`;
}

function renderTopicBlock(topicId, articles) {
  const meta = TOPIC_META[topicId];
  if (!meta) return "";
  const body = articles?.length
    ? `<div class="card-grid">${articles.map((a) => renderCard(a, topicId)).join("")}</div>`
    : `<p class="topic-empty">No fresh dispatches today.</p>`;
  return `
    <div class="topic-block" id="topic-${topicId}">
      <h3>${meta.name}</h3>
      ${body}
    </div>`;
}

function renderSections(topics) {
  return SECTION_ORDER.map((section) => {
    const topicIds = TOPIC_ORDER.filter((id) => TOPIC_META[id].section === section);
    return `
      <section class="section-group" id="section-${section.replace(/\s+/g, "-").toLowerCase()}">
        <h2>${section}</h2>
        ${topicIds.map((id) => renderTopicBlock(id, topics[id])).join("")}
      </section>`;
  }).join("");
}

function renderNav() {
  return `<nav class="section-nav" aria-label="Jump to topic">
    ${TOPIC_ORDER.map((id) => `<a href="#topic-${id}">${TOPIC_META[id].name}</a>`).join("")}
  </nav>`;
}

function renderArchive(index, activeDate, onSelect) {
  const dates = index?.dates || [];
  if (!dates.length) return null;
  const pills = dates
    .map((d) => `<button data-date="${d}" aria-current="${d === activeDate}">${d}</button>`)
    .join("");
  const el = document.createElement("div");
  el.className = "archive";
  el.innerHTML = `<h5>Past editions</h5><div class="archive-pills">${pills}</div>`;
  el.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-date]");
    if (btn) onSelect(btn.dataset.date);
  });
  return el;
}

function renderFooter() {
  return `<footer class="masthead-footer">
    <span>The Manifest is an automated digest. Headlines, summaries, and thumbnails are pulled from each publisher's own syndication feed (or an original illustration when none is provided); every story links back to the original source.</span>
    <a href="https://github.com/yousafkhamza" target="_blank" rel="noopener noreferrer">github.com/yousafkhamza</a>
  </footer>`;
}

async function renderEdition(edition, index) {
  const totalTopics = Object.values(edition.topics || {}).filter((a) => a?.length).length;

  app.innerHTML = `
    <header class="masthead">
      <p class="kicker">All Systems, Reported</p>
      <h1>The Manifest</h1>
      <p class="tagline">A daily front page for cloud &amp; infrastructure</p>
      <div class="dateline">
        <span>${formatDate(edition.date)}</span>
        <span>Edition No. ${index?.editionNumber ?? "—"} · ${edition.totalArticles ?? 0} dispatches · ${totalTopics} beats reporting</span>
      </div>
      ${renderTicker(edition.ticker)}
    </header>
    ${renderNav()}
    <main>${renderSections(edition.topics || {})}</main>
  `;

  const archiveEl = renderArchive(index, edition.date, loadEdition);
  if (archiveEl) app.appendChild(archiveEl);

  const footerWrap = document.createElement("div");
  footerWrap.innerHTML = renderFooter();
  app.appendChild(footerWrap.firstElementChild);
}

let cachedIndex = null;

async function loadEdition(date) {
  try {
    const path = date ? `${base}data/editions/${date}.json` : `${base}data/latest.json`;
    const edition = await fetchJSON(path);
    await renderEdition(edition, cachedIndex);
  } catch (err) {
    app.innerHTML = `<p class="loading-note">Couldn't load that edition (${err.message}). The first edition publishes after the daily collector runs.</p>`;
  }
}

async function init() {
  try {
    cachedIndex = await fetchJSON(`${base}data/index.json`).catch(() => null);
    await loadEdition();
  } catch (err) {
    app.innerHTML = `<p class="loading-note">Couldn't load today's edition (${err.message}).</p>`;
  }
}

init();
