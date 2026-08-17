import { css } from 'lit';

export const styles = css`
  :host {
    --on-surface: var(--on-surface-dark, #1f1b13);
    --surface: var(--surface-dark, #fff8f0);

    box-sizing: border-box;
    background-color: var(--surface);
    color: var(--on-surface);
    overflow: hidden;
  }

  .scroller {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 2.5rem;
  }

  .region {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .zone {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .footer-content {
    width: 100%;
    padding: 5rem 0 2rem;
  }

  a {
    text-decoration: none;
    color: var(--primary);
  }
  a:hover,
  a:focus {
    color: var(--on-surface-variant);
  }

  /* 768px */
  @media (min-width: 48rem) {
    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  /* 1024px */
  @media (min-width: 60rem) {
    .zone {
      max-width: 58rem;
      margin: 0 auto;
    }

    .footer-content {
      max-width: 58rem;
      margin: 0 auto;
    }
  }

  /* 1440px */
  @media (min-width: 90rem) {
    .zone {
      max-width: 71.5rem;
    }

    .footer-content {
      max-width: 71.5rem;
    }
  }

  /* DARK MODE */
  /* @media (prefers-color-scheme: dark) {
    :host {
      --on-surface-dark: #EAE2D4;
      --surface-dark: #16130B;
    }
  } */

  :root[color-scheme-dark] {
    --on-surface-dark: #eae2d4;
    --surface-dark: #16130b;
  }
`;
