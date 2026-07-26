#!/usr/bin/env node
// Collects the day's edition of The Manifest: pulls each topic's official
// RSS/Atom feeds, keeps only the publisher-provided title + short summary +
// thumbnail + link, and writes it to data/editions/YYYY-MM-DD.json.
//
// This is an aggregator, not a republisher: no article body is ever stored,
// only what the feed itself hands out for syndication.

import Parser from "rss-parser";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS, VERSION_TICKER, ARTICLES_PER_TOPIC, RETAIN_DAYS } from "./topics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
// Lives under public/ so `vite build` copies it straight into dist/.
const EDITIONS_DIR = path.join(ROOT, "public", "data", "editions");
const INDEX_PATH = path.join(ROOT, "public", "data", "index.json");
const LATEST_PATH = path.join(ROOT, "public", "data", "latest.json");

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; TheManifestBot/1.0; +https://github.com/yousafkhamza/the-manifest)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, max = 600) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function firstImgSrc(html = "") {
  if (!html) return null;
  // Lazy-loading themes often stash the real image in a <noscript> fallback
  // (meant for non-JS clients — which an RSS reader effectively is) or in
  // a data-src/data-lazy-src attribute, leaving `src` as a blank placeholder.
  const noscriptMatch = html.match(/<noscript>[\s\S]*?<img[^>]+src=["']([^"']+)["'][\s\S]*?<\/noscript>/i);
  if (noscriptMatch) return noscriptMatch[1];

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const attrPriority = ["data-src", "data-lazy-src", "data-original", "src"];
  for (const tag of imgTags) {
    for (const attr of attrPriority) {
      const m = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
      if (m && m[1] && /^https?:\/\//i.test(m[1])) return m[1];
    }
  }
  return null;
}

function extractImage(item) {
  if (item.mediaContent?.length) {
    const withUrl = item.mediaContent.find((m) => m?.$?.url);
    if (withUrl) return withUrl.$.url;
  }
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  if (item.enclosure?.url && /^image\//.test(item.enclosure.type || "")) {
    return item.enclosure.url;
  }
  const fromContent = firstImgSrc(item["content:encoded"] || item.content || "");
  if (fromContent) return fromContent;
  return null;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err) {
  return /status code (429|500|502|503|504)/i.test(err.message || "");
}

async function fetchFeed(feedUrl, attempt = 1) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const sourceName = feed.title || hostnameOf(feedUrl);
    return (feed.items || []).map((item) => {
      const summarySource = item.contentSnippet || stripHtml(item.content || item.summary || "");
      return {
        title: (item.title || "").trim(),
        link: item.link || item.guid || "",
        summary: truncate(summarySource),
        image: extractImage(item),
        source: sourceName,
        published: item.isoDate || item.pubDate || null,
      };
    });
  } catch (err) {
    if (isRetryable(err) && attempt < 3) {
      const delay = attempt * 2000;
      console.error(`  ! ${feedUrl} (${err.message}) — retrying in ${delay}ms (attempt ${attempt + 1}/3)`);
      await sleep(delay);
      return fetchFeed(feedUrl, attempt + 1);
    }
    console.error(`  ! failed to fetch ${feedUrl}: ${err.message}`);
    return [];
  }
}

async function collectTopic(topic) {
  console.log(`Collecting ${topic.name}...`);
  const results = await Promise.all(topic.feeds.map(fetchFeed));
  const merged = results.flat().filter((a) => a.title && a.link);

  const seen = new Set();
  const deduped = merged.filter((a) => {
    if (seen.has(a.link)) return false;
    seen.add(a.link);
    return true;
  });

  deduped.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));

  return deduped.slice(0, ARTICLES_PER_TOPIC);
}

async function resolveVersion(tool) {
  try {
    const headers = {
      "User-Agent": "TheManifestNewsBot/1.0",
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com/repos/${tool.repo}/releases?per_page=15`, {
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const releases = await res.json();
    const match = releases.find((r) => {
      if (r.draft) return false;
      const tag = r.tag_name || "";
      if (tool.tagFilter) return tool.tagFilter.test(tag);
      return true;
    });
    if (!match) return { label: tool.label, version: null };
    let version = match.tag_name || "";
    if (tool.prefix && version.startsWith(tool.prefix)) {
      version = version.slice(tool.prefix.length);
    }
    return { label: tool.label, version };
  } catch (err) {
    console.error(`  ! version lookup failed for ${tool.repo}: ${err.message}`);
    return { label: tool.label, version: null };
  }
}

async function buildTicker() {
  console.log("Resolving version ticker...");
  return Promise.all(VERSION_TICKER.map(resolveVersion));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  await fs.mkdir(EDITIONS_DIR, { recursive: true });

  const date = todayStr();
  const topicsData = {};
  for (const topic of TOPICS) {
    topicsData[topic.id] = await collectTopic(topic);
  }
  const ticker = await buildTicker();

  const totalArticles = Object.values(topicsData).reduce((n, a) => n + a.length, 0);
  const edition = {
    date,
    generatedAt: new Date().toISOString(),
    totalArticles,
    ticker,
    topics: topicsData,
  };

  const editionPath = path.join(EDITIONS_DIR, `${date}.json`);
  await fs.writeFile(editionPath, JSON.stringify(edition, null, 2));
  await fs.writeFile(LATEST_PATH, JSON.stringify(edition, null, 2));

  // Maintain a rolling index of the last RETAIN_DAYS editions and prune older files.
  const allFiles = (await fs.readdir(EDITIONS_DIR)).filter((f) => f.endsWith(".json")).sort();
  const keep = allFiles.slice(-RETAIN_DAYS);
  const drop = allFiles.filter((f) => !keep.includes(f));
  await Promise.all(drop.map((f) => fs.unlink(path.join(EDITIONS_DIR, f))));

  const dates = keep.map((f) => f.replace(".json", ""));
  await fs.writeFile(
    INDEX_PATH,
    JSON.stringify({ dates: dates.reverse(), editionNumber: computeEditionNumber(dates) }, null, 2)
  );

  console.log(`\nEdition ${date}: ${totalArticles} articles across ${TOPICS.length} topics.`);

  // rss-parser's HTTP timeout rejects the promise but never destroys the
  // underlying socket (see its lib/parser.js) — a single timed-out feed
  // leaves a dangling open connection that keeps Node's event loop alive
  // indefinitely even though all our own work is done. Force the exit.
  process.exit(0);
}

// Edition number counts up from a fixed launch date so it behaves like a
// real newspaper's "Vol. N" rather than resetting with the archive window.
function computeEditionNumber(dates) {
  const LAUNCH = new Date("2026-07-14T00:00:00Z");
  const latest = new Date(dates[dates.length - 1] + "T00:00:00Z");
  const days = Math.round((latest - LAUNCH) / 86400000);
  return Math.max(1, days + 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
