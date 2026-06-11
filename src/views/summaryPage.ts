import type { SummaryMetrics } from '../db/summaryRepository.js'
import { VANCOUVER_TIME_ZONE } from '../lib/vancouverDayBounds.js'
import { escapeHtml } from './html.js'
import { summaryPageStyles } from './styles.js'

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
    .map(
      (page, index) => `
        <li class="top-page-item">
          <span class="top-page-name">${index + 1}. ${escapeHtml(page.screenName)}</span>
          <span class="top-page-views">${formatNumber(page.views)} views</span>
        </li>`,
    )
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
    <style>${summaryPageStyles}</style>
  </head>
  <body>
    <main>
      <header>
        <h1>WorkBC Analytics Summary</h1>
        <p class="meta">Generated ${escapeHtml(formatGeneratedAt(generatedAt))}</p>
      </header>

      <section>
        <h2>Unique Visitors</h2>
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

      <section>
        <h2>Authentication (All Time)</h2>
        <div class="auth-bar">
          <div
            class="auth-bar-authenticated"
            style="width: ${authenticatedBarWidth}%"
          ></div>
          <div class="auth-bar-not-authenticated"></div>
        </div>
        <div class="auth-stats">
          <span>${authenticatedPercent} logged in (${formatNumber(metrics.authenticatedEvents)} events)</span>
          <span>${notAuthenticatedPercent} not logged in (${formatNumber(metrics.notAuthenticatedEvents)} events)</span>
        </div>
      </section>

      <section>
        <h2>Errors (All Time)</h2>
        <div class="cards">
          <article class="card">
            <div class="card-label">Total Errors</div>
            <div class="card-value">${formatNumber(metrics.totalErrors)}</div>
          </article>
        </div>
      </section>

      <section>
        <h2>Top Pages (All Time)</h2>
        ${renderTopPages(metrics.topPages)}
      </section>
    </main>
  </body>
</html>`
}
