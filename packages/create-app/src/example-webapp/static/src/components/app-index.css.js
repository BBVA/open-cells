import { css } from 'lit';

export const styles = css`
  :host {
    --on-surface-variant: var(--on-surface-variant-dark, #53433f);
    --on-surface: var(--on-surface-dark, #1f1b13);
    --primary: var(--primary-dark, #725c0c);
    --surface: var(--surface-dark, #fff8f0);
    --surface-container-highest: var(--surface-container-highest-dark, #eae2d4);
    --surface-container: var(--surface-container-dark, #f5eddf);
    --outline: var(--outline-dark, #85736e);
    --header-gradient: var(--header-gradient-dark, rgba(255, 248, 240, 1));

    /* icon-button */
    --md-outlined-icon-button-hover-state-layer-color: var(--surface-container-highest);
    --md-outlined-icon-button-pressed-state-layer-color: var(--surface-container-highest);
    --md-outlined-icon-button-hover-state-layer-opacity: 0.3;

    --md-outlined-icon-button-outline-color: var(--outline);
    --md-outlined-icon-button-pressed-outline-color: var(--on-surface-variant);

    --md-outlined-icon-button-icon-color: var(--primary);
    --md-outlined-icon-button-focus-icon-color: var(--on-surface-variant);
    --md-outlined-icon-button-hover-icon-color: var(--on-surface-variant);
    --md-outlined-icon-button-pressed-icon-color: var(--on-surface-variant);

    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }

  header {
    width: 100%;
    background-color: var(--surface);
    color: var(--primary);
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding: 1rem 0;
  }

  .header-content::after {
    content: '';
    width: 100%;
    height: 2.75rem;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, var(--header-gradient) 100%);
    position: absolute;
    bottom: -1.5rem;
    left: 0;
    z-index: 1;
  }

  .header-logo {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    line-height: 1.5rem;
    font-weight: 300;
  }

  a {
    text-decoration: none;
    color: var(--primary);
  }

  main {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  main ::slotted(*) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: hidden;
  }

  main ::slotted([state='active']) {
    visibility: visible;
  }

  /* 1024px */
  @media (min-width: 64rem) {
    header {
      display: flex;
      flex-direction: column;
      justify-content: center;
      max-width: 58rem;
      height: 8rem;
      margin: 0 auto;
      will-change: height;
      transition: height 0.1s ease-in-out;
    }
    header.scrolled {
      height: 5rem;
    }
  }

  /* 1440px */
  @media (min-width: 90rem) {
    header {
      max-width: 71.5rem;
    }
  }

  /* DARK MODE */
  /* @media (prefers-color-scheme: dark) {
    :host {
      --primary-dark: #E2C46D;
      --on-surface-dark: #EAE2D4;
      --on-surface-variant-dark: #CFC6B4;
      --surface-container-dark: #2D2A21;
      --surface-container-high-dark: #2D2A21;
      --surface-container-highest-dark: #38342B;
      --surface-dark: #16130B;
      --outline-dark: #989080;
    }
  } */

  :root[color-scheme-dark] {
    --primary-dark: #e2c46d;
    --on-surface-dark: #eae2d4;
    --on-surface-variant-dark: #cfc6b4;
    --surface-container-dark: #2d2a21;
    --surface-container-high-dark: #2d2a21;
    --surface-container-highest-dark: #38342b;
    --surface-dark: #16130b;
    --outline-dark: #989080;
    --header-gradient-dark: rgba(22, 19, 11, 1);
  }
`;
