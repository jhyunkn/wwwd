// WWWD static build — dependency-free.
// Source of truth: assets/portfolio/manifest.json (images+captions) + content/investigations/*.json (narrative).
// Emits crawlable, per-page static HTML. Enforces the publish gate at build time.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "WWWD";
const THESIS = "WWWD investigates space by making — testing how ideas become inhabitable.";
const ORIGIN = "https://wwwd-theta.vercel.app";

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hasPlaceholder = (s = "") => String(s).includes("‹"); // detects ‹…› draft markers

// ---- load content ----
const manifest = JSON.parse(readFileSync(join(ROOT, "assets/portfolio/manifest.json"), "utf8"));
const imagesByProject = new Map();
for (const row of manifest) {
  if (!imagesByProject.has(row.project)) imagesByProject.set(row.project, []);
  imagesByProject.get(row.project).push(row);
}

const invDir = join(ROOT, "content/investigations");
const investigations = readdirSync(invDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(invDir, f), "utf8")));

// ---- the publish gate ----
const REQUIRED = ["claim", "heroImage", "heroCaption", "context", "method", "artifact", "consequence"];
function evaluate(inv) {
  const missing = REQUIRED.filter((k) => !inv[k] || !String(inv[k]).trim());
  const draftFlags = REQUIRED.some((k) => hasPlaceholder(inv[k])) || inv.claimDraft || inv.consequenceDraft;
  const approved = inv.status === "approved";
  if (approved && (missing.length || draftFlags)) {
    throw new Error(
      `PUBLISH GATE FAILED for "${inv.slug}": approved Investigations need all five fields real. ` +
        `Missing: [${missing.join(", ")}]${draftFlags ? " + unresolved draft/placeholder copy" : ""}.`
    );
  }
  return { approved: approved && !missing.length && !draftFlags, isDraft: !approved };
}

// ---- shared chrome ----
const head = (title, desc, path, ogImage) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${ORIGIN}${path}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
${ogImage ? `<meta property="og:image" content="${ORIGIN}${esc(ogImage)}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
<link rel="stylesheet" href="/site.css" />
</head>
<body>`;

const header = `<header class="wwwd-site-header"><div class="wwwd-wrap"><nav class="wwwd-nav">
<a class="wwwd-brand" href="/">WWWD</a>
<span class="wwwd-nav-links"><a href="/#investigations">investigations</a><a href="/#notes">notes</a><a href="/#studio">studio</a></span>
</nav></div></header>`;

const footer = `<footer class="wwwd-footer"><div class="wwwd-wrap" id="studio">
<div class="wwwd-footlinks"><a href="/">WWWD</a><a href="mailto:hello@wwwd.studio">contact</a></div>
<div>A thinking practice that builds. Architecture and spatial research, New York.</div>
</div></footer></body></html>`;

const block = (label, text) =>
  `<div class="wwwd-block"><div class="wwwd-label">${esc(label)}</div><p>${esc(text)}</p></div>`;

// ---- investigation page ----
function renderInvestigation(inv, verdict) {
  const imgs = imagesByProject.get(inv.slug) || [];
  const gallery = imgs.filter((r) => r.file !== inv.heroImage && !/thumb\./.test(r.file));
  const desc = String(inv.claim).replace(/[‹›]/g, "");
  const draftBanner = verdict.isDraft
    ? `<div class="wwwd-draft">Draft — preview only. Not an approved Investigation until the claim and external consequence are confirmed.</div>`
    : "";
  const consequenceHtml = hasPlaceholder(inv.consequence)
    ? `<div class="wwwd-block"><div class="wwwd-label">Consequence</div><div class="wwwd-draft">${esc(inv.consequence)}</div></div>`
    : block("Consequence", inv.consequence);
  const notes = inv.notes
    ? `<div class="wwwd-notes"><div class="wwwd-label">Notes</div><dl>${Object.entries(inv.notes)
        .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
        .join("")}</dl></div>`
    : "";
  return (
    head(`${SITE} — ${inv.title}`, desc, `/work/${inv.slug}`, inv.heroImage) +
    header +
    `<main class="wwwd-wrap"><a class="wwwd-backlink" href="/#investigations">← investigations</a>
${draftBanner}
<article class="wwwd-measure">
<h1 class="wwwd-claim">${esc(inv.claim)}</h1>
<figure class="wwwd-lead"><img src="${esc(inv.heroImage)}" alt="${esc(inv.heroCaption)}" />
<figcaption>${esc(inv.heroCaption)}</figcaption></figure>
${block("Context", inv.context)}
${block("Method", inv.method)}
${block("Artifact", inv.artifact)}
${consequenceHtml}
</article>
<div class="wwwd-measure">
${gallery
  .map(
    (r) =>
      `<figure class="wwwd-fig"><img src="${esc(r.file)}" alt="${esc(r.caption)}" loading="lazy" /><figcaption>${esc(
        r.caption
      )}</figcaption></figure>`
  )
  .join("\n")}
<div class="wwwd-measure">${notes}</div>
</div>
</main>` +
    footer
  );
}

// ---- homepage ----
function renderHome(approved, drafts) {
  const invRows = (list, draft) =>
    list
      .map(
        (inv) =>
          `<a class="wwwd-invrow" href="/work/${inv.slug}">
<div class="wwwd-invtitle">${esc(inv.title)}${draft ? ' <span class="wwwd-label">draft</span>' : ""}</div>
<div class="wwwd-invclaim">${esc(String(inv.claim).replace(/[‹›]/g, ""))}</div></a>`
      )
      .join("\n");

  const approvedSection = approved.length
    ? `<div class="wwwd-invlist">${invRows(approved, false)}</div>`
    : `<p class="wwwd-invclaim">No approved Investigations yet — each must land in a real external consequence before it appears here.</p>`;

  const draftSection = drafts.length
    ? `<div class="wwwd-section"><div class="wwwd-label">In progress — preview only</div>
<div class="wwwd-invlist">${invRows(drafts, true)}</div></div>`
    : "";

  return (
    head(SITE, THESIS, "/", "/assets/portfolio/chankillo/hero.webp") +
    header +
    `<main class="wwwd-wrap">
<section class="wwwd-hero"><h1>${esc(THESIS)}</h1>
<p class="wwwd-sub">A thinking practice that builds. Architecture and spatial research, New York.</p></section>

<section class="wwwd-section" id="investigations"><h2>Investigations</h2>
${approvedSection}
${draftSection}
</section>

<section class="wwwd-section" id="proof"><div class="wwwd-label">Exhibited · Commissioned · Collaborated · Published</div>
<p class="wwwd-invclaim">Populated from approved Investigations — a scannable index into the work, each item linking to the full page.</p></section>

<section class="wwwd-section" id="notes"><h2>Notes</h2>
<p class="wwwd-invclaim">The indexable long tail — shorter observations that have not (yet) produced an external artifact.</p></section>
</main>` +
    footer
  );
}

// ---- write ----
const OUT_WORK = join(ROOT, "work");
if (existsSync(OUT_WORK)) rmSync(OUT_WORK, { recursive: true, force: true });

const approved = [];
const drafts = [];
for (const inv of investigations) {
  const verdict = evaluate(inv);
  (verdict.approved ? approved : drafts).push(inv);
  const dir = join(OUT_WORK, inv.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), renderInvestigation(inv, verdict));
  console.log(`  page  /work/${inv.slug}  [${verdict.approved ? "APPROVED" : "draft"}]`);
}
writeFileSync(join(ROOT, "index.html"), renderHome(approved, drafts));
console.log(`  home  /  (${approved.length} approved, ${drafts.length} draft)`);
console.log("build ok");
