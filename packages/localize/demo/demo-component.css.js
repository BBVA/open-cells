import { css } from 'lit';

export default css`
  :host {
    display: block;
    box-sizing: border-box;
    border: 1px solid #121212;
    padding: 1rem;
    margin: 1rem 0;
    color: #121212;
  }

  * {
    box-sizing: inherit;
  }

  h2 {
    margin: 0 0 1rem;
    font-weight: 500;
    font-size: 1.125rem;
    line-height: 1.5rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li ~ li {
    margin: 1rem 0 0;
  }

  li p {
    margin: 0;
    display: flex;
    line-height: 1.5rem;
  }

  .h {
    text-transform: uppercase;
    font-weight: 300;
    color: #666;
    font-size: .675rem;
    padding: .25rem .5rem .25rem 0;
    min-width: 4rem;
  }

  .output .h {
    padding: .5rem .5rem .5rem 0;
  }

  code {
    flex: auto;
    padding: .25rem .5rem;
    color: #f4f4f4;
    background-color: #121212;
    font-size: .75rem;
  }

  .result {
    flex: auto;
    padding: .5rem;
    border: 1px solid #666;
    font-size: .9375rem;
    min-height: 2.625rem;
  }

`;
