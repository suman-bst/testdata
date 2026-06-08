const app = document.querySelector("#app");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const pageSize = 1;
const siteRoot = new URL(".", document.baseURI);
const penThemes = [
  ["#20324a", "#55799d"],
  ["#21735b", "#69a88e"],
  ["#8e3d41", "#d27b6f"],
  ["#7d5b23", "#d5a341"],
  ["#373b45", "#8c94a0"]
];

let results = [];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSearchState() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q")?.trim() || "";
  const requestedPage = Number(params.get("page") || "1");
  const totalPages = Math.ceil(results.length / pageSize);
  const page = clamp(Number.isFinite(requestedPage) ? requestedPage : 1, 1, totalPages);

  return { query, page, totalPages };
}

function rootUrl(path = "") {
  return new URL(path, siteRoot).toString();
}

function searchUrl(query, page) {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("page", String(page));
  return rootUrl(`?${params.toString()}`);
}

function listingUrl(listingId) {
  return rootUrl(`bid/${encodeURIComponent(listingId)}/`);
}

function displayListingUrl(listingId) {
  return listingUrl(listingId);
}

function penArt(result) {
  const theme = penThemes[(result.rank - 1) % penThemes.length];
  return `
    <div class="product-art" aria-hidden="true">
      <div
        class="pen-body"
        style="--pen-a: ${theme[0]}; --pen-b: ${theme[1]}"
      ></div>
    </div>
  `;
}

function emptyPenVisual() {
  return `
    <div class="pen-visual" aria-hidden="true">
      <svg viewBox="0 0 320 180" role="img">
        <rect x="28" y="120" width="206" height="18" rx="9" fill="#20324a" transform="rotate(-18 28 120)" />
        <rect x="70" y="108" width="68" height="6" rx="3" fill="#ffffff" opacity="0.7" transform="rotate(-18 70 108)" />
        <path d="M231 78 L291 88 L241 122 Z" fill="#b9791b" />
        <circle cx="73" cy="135" r="24" fill="#21735b" opacity="0.16" />
        <circle cx="239" cy="50" r="34" fill="#8e3d41" opacity="0.12" />
      </svg>
    </div>
  `;
}

function renderEmptyState() {
  app.innerHTML = `
    <div class="empty-state">
      ${emptyPenVisual()}
      <div class="empty-copy">
        <h2>Search once, then walk the fixed ${results.length}-page result set.</h2>
        <p>
          Every query returns the same deterministic listings. Each page contains one
          product card with a stable, hash-like bid URL for repeatable navigation evals.
        </p>
      </div>
    </div>
  `;
}

function renderResults() {
  const { query, page, totalPages } = getSearchState();

  if (!query) {
    searchInput.value = "";
    renderEmptyState();
    return;
  }

  searchInput.value = query;

  const result = results[page - 1];
  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const previousDisabled = page === 1;
  const nextDisabled = page === totalPages;

  app.innerHTML = `
    <div class="results-meta">
      <div>
        <h2>${results.length} results found for "${escapeHtml(query)}"</h2>
        <p>One listing is shown on each page.</p>
      </div>
      <div class="page-status">Page ${page}/${totalPages}</div>
    </div>

    <article
      class="product-card"
      data-result-rank="${result.rank}"
      data-listing-id="${escapeHtml(result.listingId)}"
    >
      ${penArt(result)}
      <div class="product-info">
        <div class="rank-line">
          <span class="badge">Result ${result.rank}/${results.length}</span>
          <span class="variant">${escapeHtml(result.variant)}</span>
        </div>
        <h3>${escapeHtml(result.name)}</h3>
        <p class="price">$${escapeHtml(result.price)}</p>
        <div class="listing-url">
          <span>Listing URL</span>
          <code>${escapeHtml(displayListingUrl(result.listingId))}</code>
        </div>
        <a class="listing-link" href="${listingUrl(result.listingId)}">Open listing</a>
      </div>
    </article>

    <nav class="pagination" aria-label="Search result pages">
      <div class="pagination-controls">
        <a
          class="pager-button"
          href="${searchUrl(query, previousPage)}"
          aria-disabled="${previousDisabled}"
          aria-label="Previous result, ${previousPage} of ${results.length}"
        >&lt; ${previousPage}/${results.length}</a>
        <a
          class="pager-button"
          href="${searchUrl(query, nextPage)}"
          aria-disabled="${nextDisabled}"
          aria-label="Next result, ${nextPage} of ${results.length}"
        >${nextPage}/${results.length} &gt;</a>
      </div>
    </nav>
  `;
}

function renderDetail(listingId) {
  const result = results.find((item) => item.listingId === listingId);

  if (!result) {
    app.innerHTML = `
      <div class="not-found">
        <div>
          <h2>Listing not found</h2>
          <p class="detail-kicker">No deterministic fixture uses bid ID ${escapeHtml(listingId)}.</p>
          <p><a class="back-link" href="${rootUrl()}">Back to search</a></p>
        </div>
      </div>
    `;
    return;
  }

  searchInput.value = "";
  app.innerHTML = `
    <article class="detail-page" data-listing-id="${escapeHtml(result.listingId)}">
      ${penArt(result)}
      <div>
        <p class="detail-kicker">Bid listing ${escapeHtml(result.listingId)}</p>
        <h2>${escapeHtml(result.name)}</h2>
        <div class="detail-grid">
          <div class="detail-box">
            <span>Result rank</span>
            <strong>${result.rank}</strong>
          </div>
          <div class="detail-box">
            <span>Price</span>
            <strong>$${escapeHtml(result.price)}</strong>
          </div>
          <div class="detail-box">
            <span>Variant</span>
            <strong>${escapeHtml(result.variant)}</strong>
          </div>
          <div class="detail-box">
            <span>Stable URL</span>
            <strong>${escapeHtml(displayListingUrl(result.listingId))}</strong>
          </div>
        </div>
        <a class="back-link" href="${searchUrl("pens", result.rank)}">Back to result page ${result.rank}</a>
      </div>
    </article>
  `;
}

function render() {
  const rootPath = siteRoot.pathname;
  let relativePath = window.location.pathname.startsWith(rootPath)
    ? window.location.pathname.slice(rootPath.length)
    : window.location.pathname.replace(/^\//, "");
  relativePath = relativePath.replace(/\/index\.html$/, "/").replace(/\/$/, "");
  const bidMatch = relativePath.match(/^bid\/([^/]+)$/);

  if (bidMatch) {
    renderDetail(decodeURIComponent(bidMatch[1]));
    return;
  }

  renderResults();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    window.history.pushState({}, "", rootUrl());
    render();
    return;
  }

  window.history.pushState({}, "", searchUrl(query, 1));
  render();
});

window.addEventListener("popstate", render);

fetch(rootUrl("results.json"))
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load results.json: ${response.status}`);
    }
    return response.json();
  })
  .then((loadedResults) => {
    results = loadedResults;
    render();
  })
  .catch((error) => {
    app.innerHTML = `<div class="not-found"><p>${escapeHtml(error.message)}</p></div>`;
  });
