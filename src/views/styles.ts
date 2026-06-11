export const summaryPageStyles = `
  :root {
    color-scheme: light dark;
    --bg: #f4f6f8;
    --card: #ffffff;
    --text: #1f2933;
    --muted: #52606d;
    --border: #d9e2ec;
    --accent: #005ea2;
    --accent-soft: #e8f1fb;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f1720;
      --card: #1b2430;
      --text: #f5f7fa;
      --muted: #9fb3c8;
      --border: #334155;
      --accent: #7cc0ff;
      --accent-soft: #1e293b;
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
  }

  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.25rem 3rem;
  }

  header {
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
  }

  .meta {
    color: var(--muted);
    font-size: 0.95rem;
  }

  section {
    margin-bottom: 2rem;
  }

  h2 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
  }

  .card-label {
    color: var(--muted);
    font-size: 0.875rem;
    margin-bottom: 0.35rem;
  }

  .card-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .auth-bar {
    display: flex;
    height: 1.25rem;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 0.75rem;
  }

  .auth-bar-authenticated {
    background: var(--accent);
  }

  .auth-bar-not-authenticated {
    background: var(--accent-soft);
    flex: 1;
  }

  .auth-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: var(--muted);
    font-size: 0.95rem;
  }

  .top-pages {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.75rem;
  }

  .top-page-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.875rem 1rem;
  }

  .top-page-name {
    font-weight: 600;
  }

  .top-page-views {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--muted);
  }

  .empty-state {
    color: var(--muted);
    font-style: italic;
  }
`
