export const summaryPageStyles = `
  @font-face {
    font-family: 'BCSans';
    font-style: normal;
    font-weight: 400;
    src: url('https://cdn.jsdelivr.net/npm/@bcgov/bc-sans@2/fonts/BCSans-Regular.woff2') format('woff2');
  }

  @font-face {
    font-family: 'BCSans';
    font-style: normal;
    font-weight: 700;
    src: url('https://cdn.jsdelivr.net/npm/@bcgov/bc-sans@2/fonts/BCSans-Bold.woff2') format('woff2');
  }

  :root {
    --typography-color-primary: #2d2d2d;
    --typography-color-secondary: #474543;
    --typography-color-disabled: #9f9d9c;
    --typography-color-link: #255a90;
    --typography-color-danger: #ce3e39;
    --typography-color-primary-invert: #ffffff;
    --typography-color-secondary-invert: #eceae8;

    --surface-background-white: #ffffff;
    --surface-background-light-gray: #faf9f8;
    --surface-background-light-blue: #f1f8fe;
    --surface-background-dark-blue: #013366;
    --surface-border-light: #d8d8d8;
    --surface-border-medium: #898785;
    --surface-primary-default: #013366;
    --surface-primary-hover: #1e5189;

    --theme-primary-blue: #013366;
    --theme-primary-gold: #fcba19;
    --theme-blue-10: #f1f8fe;
    --theme-blue-20: #d8eafd;
    --theme-gray-20: #f3f2f1;
    --theme-gray-30: #eceae8;

    --support-surface-danger: #f4e1e2;
    --support-border-danger: #ce3e39;
    --support-surface-info: #f7f9fc;
    --support-border-info: #053662;

    --layout-margin-medium: 0.5rem;
    --layout-margin-large: 1rem;
    --layout-margin-xlarge: 1.5rem;
    --layout-margin-xxlarge: 2rem;
    --layout-margin-huge: 3rem;
    --layout-padding-medium: 1rem;
    --layout-padding-large: 1.5rem;
    --layout-padding-xlarge: 2rem;
    --layout-border-radius-medium: 4px;
    --layout-border-width-small: 1px;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'BCSans', 'Noto Sans', sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--typography-color-primary);
    background: var(--surface-background-light-gray);
  }

  .skip-link {
    position: absolute;
    top: -3rem;
    left: var(--layout-margin-large);
    z-index: 100;
    padding: var(--layout-margin-medium) var(--layout-padding-medium);
    background: var(--surface-background-dark-blue);
    color: var(--typography-color-primary-invert);
    text-decoration: none;
    border-radius: var(--layout-border-radius-medium);
  }

  .skip-link:focus {
    top: var(--layout-margin-large);
    outline: 3px solid var(--theme-primary-gold);
    outline-offset: 2px;
  }

  .site-header {
    background: var(--surface-background-white);
    color: var(--typography-color-primary);
    border-bottom: var(--layout-border-width-small) solid var(--surface-border-light);
  }

  .site-header-inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: var(--layout-padding-medium) var(--layout-padding-xlarge);
    display: flex;
    align-items: center;
    gap: var(--layout-margin-xlarge);
    flex-wrap: wrap;
  }

  .site-header-logo {
    display: block;
    width: auto;
    max-height: 60px;
  }

  .site-header-brand {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .site-header-title {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.5;
    color: var(--theme-primary-blue);
  }

  .site-header-subtitle {
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--typography-color-secondary);
  }

  .site-header-accent {
    height: 4px;
    background: var(--theme-primary-gold);
  }

  .page-content {
    max-width: 72rem;
    margin: 0 auto;
    padding: var(--layout-margin-xxlarge) var(--layout-padding-xlarge)
      var(--layout-margin-huge);
  }

  .page-header {
    margin-bottom: var(--layout-margin-xxlarge);
    padding-bottom: var(--layout-margin-xlarge);
    border-bottom: var(--layout-border-width-small) solid var(--surface-border-light);
  }

  h1 {
    margin: 0 0 var(--layout-margin-medium);
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.5;
    color: var(--typography-color-primary);
  }

  .meta {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--typography-color-secondary);
  }

  section {
    margin-bottom: var(--layout-margin-xxlarge);
  }

  h2 {
    margin: 0 0 var(--layout-margin-large);
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.5;
    color: var(--typography-color-primary);
  }

  .section-intro {
    margin: calc(-1 * var(--layout-margin-medium)) 0 var(--layout-margin-large);
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--typography-color-secondary);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--layout-margin-large);
  }

  .card {
    background: var(--surface-background-white);
    border: var(--layout-border-width-small) solid var(--surface-border-light);
    border-radius: var(--layout-border-radius-medium);
    padding: var(--layout-padding-medium) var(--layout-padding-large);
  }

  .card-label {
    margin-bottom: var(--layout-margin-medium);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: 400;
    color: var(--typography-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .card-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.5;
    color: var(--theme-primary-blue);
  }

  .card-danger {
    border-color: var(--support-border-danger);
    background: var(--support-surface-danger);
  }

  .card-danger .card-value {
    color: var(--typography-color-danger);
  }

  .auth-panel {
    background: var(--surface-background-white);
    border: var(--layout-border-width-small) solid var(--surface-border-light);
    border-radius: var(--layout-border-radius-medium);
    padding: var(--layout-padding-large);
  }

  .auth-bar {
    display: flex;
    height: 1.5rem;
    border-radius: var(--layout-border-radius-medium);
    overflow: hidden;
    border: var(--layout-border-width-small) solid var(--surface-border-light);
    margin-bottom: var(--layout-margin-large);
  }

  .auth-bar-authenticated {
    background: var(--theme-primary-blue);
    min-width: 0;
  }

  .auth-bar-not-authenticated {
    background: var(--theme-blue-20);
    flex: 1;
    min-width: 0;
  }

  .auth-legend {
    display: grid;
    gap: var(--layout-margin-medium);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .auth-legend-item {
    display: flex;
    align-items: flex-start;
    gap: var(--layout-margin-medium);
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--typography-color-secondary);
  }

  .auth-legend-swatch {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    border: var(--layout-border-width-small) solid var(--surface-border-light);
    border-radius: var(--layout-border-radius-medium);
  }

  .auth-legend-swatch-authenticated {
    background: var(--theme-primary-blue);
  }

  .auth-legend-swatch-not-authenticated {
    background: var(--theme-blue-20);
  }

  .top-pages {
    list-style: none;
    padding: 0;
    margin: 0;
    border: var(--layout-border-width-small) solid var(--surface-border-light);
    border-radius: var(--layout-border-radius-medium);
    overflow: hidden;
    background: var(--surface-background-white);
  }

  .top-page-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--layout-margin-large);
    padding: var(--layout-padding-medium) var(--layout-padding-large);
    border-bottom: var(--layout-border-width-small) solid var(--surface-border-light);
  }

  .top-page-item:last-child {
    border-bottom: none;
  }

  .top-page-item:nth-child(odd) {
    background: var(--surface-background-light-gray);
  }

  .top-page-rank {
    flex-shrink: 0;
    width: 1.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--theme-primary-blue);
  }

  .top-page-name {
    flex: 1;
    font-weight: 700;
    color: var(--typography-color-primary);
  }

  .top-page-views {
    flex-shrink: 0;
    font-size: 0.875rem;
    color: var(--typography-color-secondary);
  }

  .empty-state {
    margin: 0;
    padding: var(--layout-padding-large);
    background: var(--support-surface-info);
    border: var(--layout-border-width-small) solid var(--support-border-info);
    border-radius: var(--layout-border-radius-medium);
    color: var(--typography-color-secondary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .site-footer {
    border-top: var(--layout-border-width-small) solid var(--surface-border-light);
    background: var(--surface-background-white);
    padding: var(--layout-padding-large) var(--layout-padding-xlarge);
  }

  .site-footer-inner {
    max-width: 72rem;
    margin: 0 auto;
    font-size: 0.75rem;
    line-height: 1.25;
    color: var(--typography-color-secondary);
  }

  @media (max-width: 640px) {
    .page-content,
    .site-header-inner,
    .site-footer {
      padding-left: var(--layout-padding-medium);
      padding-right: var(--layout-padding-medium);
    }

    h1 {
      font-size: 1.75rem;
    }

    h2 {
      font-size: 1.25rem;
    }

    .top-page-item {
      flex-wrap: wrap;
    }
  }
`
