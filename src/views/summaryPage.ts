import type { SummaryMetrics } from '../db/summaryRepository.js'
import { formatScreenName } from '../lib/screenLabels.js'
import { VANCOUVER_TIME_ZONE } from '../lib/vancouverDayBounds.js'
import { escapeHtml } from './html.js'
import { summaryPageStyles } from './styles.js'

const faviconHref = 'https://www2.gov.bc.ca/favicon.ico'
const headerLogoHref =
  'https://www2.gov.bc.ca/images/BCID_H_rgb_pos.png'

function formatNumber(value: number): string {
  return value.toLocaleString('en-CA')
}

function formatPercent(part: number, total: number): string {
  if (total === 0) {
    return '0%'
  }
  return `${Math.round((part / total) * 100)}%`
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VANCOUVER_TIME_ZONE,
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date)
}

function renderTopPages(topPages: SummaryMetrics['topPages']): string {
  if (topPages.length === 0) {
    return '<p class="empty-state">No page views recorded yet.</p>'
  }

  return `<ol class="top-pages">${topPages
    .map((page, index) => {
      const label = formatScreenName(page.screenName)
      return `
        <li class="top-page-item">
          <span class="top-page-rank" aria-hidden="true">${index + 1}</span>
          <span class="top-page-name" title="${escapeHtml(page.screenName)}">${escapeHtml(label)}</span>
          <span class="top-page-views">${formatNumber(page.views)} views</span>
        </li>`
    })
    .join('')}</ol>`
}

export function renderSummaryPage(
  metrics: SummaryMetrics,
  generatedAt: Date = new Date(),
): string {
  const authTotal = metrics.authenticatedEvents + metrics.notAuthenticatedEvents
  const authenticatedPercent = formatPercent(
    metrics.authenticatedEvents,
    authTotal,
  )
  const notAuthenticatedPercent = formatPercent(
    metrics.notAuthenticatedEvents,
    authTotal,
  )
  const authenticatedBarWidth =
    authTotal === 0
      ? 0
      : Math.round((metrics.authenticatedEvents / authTotal) * 100)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WorkBC Analytics Summary</title>
    <link rel="icon" href="${faviconHref}" type="image/x-icon" />
    <style>${summaryPageStyles}</style>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <header class="site-header">
      <div class="site-header-inner">
        <img
          class="site-header-logo"
          src="${headerLogoHref}"
          alt="Government of British Columbia"
          width="190"
          height="60"
        />
        <div class="site-header-brand">
          <span class="site-header-title">WorkBC</span>
          <span class="site-header-subtitle">Mobile App Analytics</span>
        </div>
      </div>
      <div class="site-header-accent" aria-hidden="true"></div>
    </header>

    <main id="main-content" class="page-content">
      <div class="page-header">
        <h1>Analytics Summary</h1>
        <p class="meta">Generated ${escapeHtml(formatGeneratedAt(generatedAt))}</p>
      </div>

      <section aria-labelledby="visitors-heading">
        <h2 id="visitors-heading">Unique Visitors</h2>
        <p class="section-intro">Distinct users by Pacific Time day boundaries.</p>
        <div class="cards">
          <article class="card">
            <div class="card-label">Today</div>
            <div class="card-value">${formatNumber(metrics.uniqueVisitorsToday)}</div>
          </article>
          <article class="card">
            <div class="card-label">Past 7 Days</div>
            <div class="card-value">${formatNumber(metrics.uniqueVisitorsLast7Days)}</div>
          </article>
          <article class="card">
            <div class="card-label">Past 30 Days</div>
            <div class="card-value">${formatNumber(metrics.uniqueVisitorsLast30Days)}</div>
          </article>
        </div>
      </section>

      <section aria-labelledby="auth-heading">
        <h2 id="auth-heading">Authentication</h2>
        <p class="section-intro">All-time event breakdown by login status.</p>
        <div class="auth-panel">
          <div
            class="auth-bar"
            role="img"
            aria-label="${authenticatedPercent} logged in, ${notAuthenticatedPercent} not logged in"
          >
            <div
              class="auth-bar-authenticated"
              style="width: ${authenticatedBarWidth}%"
            ></div>
            <div class="auth-bar-not-authenticated"></div>
          </div>
          <ul class="auth-legend">
            <li class="auth-legend-item">
              <span
                class="auth-legend-swatch auth-legend-swatch-authenticated"
                aria-hidden="true"
              ></span>
              <span>${authenticatedPercent} logged in (${formatNumber(metrics.authenticatedEvents)} events)</span>
            </li>
            <li class="auth-legend-item">
              <span
                class="auth-legend-swatch auth-legend-swatch-not-authenticated"
                aria-hidden="true"
              ></span>
              <span>${notAuthenticatedPercent} not logged in (${formatNumber(metrics.notAuthenticatedEvents)} events)</span>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="errors-heading">
        <h2 id="errors-heading">Errors</h2>
        <p class="section-intro">All-time error events reported by the mobile app.</p>
        <div class="cards">
          <article class="card card-danger">
            <div class="card-label">Total Errors</div>
            <div class="card-value">${formatNumber(metrics.totalErrors)}</div>
          </article>
        </div>
      </section>

      <section aria-labelledby="pages-heading">
        <h2 id="pages-heading">Top Pages</h2>
        <p class="section-intro">Most viewed screens across all time.</p>
        ${renderTopPages(metrics.topPages)}
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer-inner">
        &copy; ${generatedAt.getFullYear()} Government of British Columbia
      </div>
    </footer>
  </body>
</html>`
}
