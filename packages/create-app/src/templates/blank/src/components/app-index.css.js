/*
 * Copyright 2024 Bilbao Vizcaya Argentaria, S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { css } from 'lit';

export const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    font-family: 'Archivo', sans-serif;
  }

  header {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    height: 4.5rem;
    padding: 0 1.5rem;
    background: #fff;
    border-bottom: 1px solid transparent;
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    flex-shrink: 0;
    z-index: 4;
  }

  header.scrolled {
    border-bottom-color: #d1d1d1;
    box-shadow: 0 1px 5px 0 rgb(0 0 0 / 10%);
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .brand-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
  }

  .brand-logo {
    height: 2rem;
    width: auto;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-links a {
    color: #1973b8;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
  }

  .nav-links a:hover {
    color: #004481;
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
    overflow-y: auto;
  }

  main ::slotted([state='active']) {
    visibility: visible;
    animation: page-in 0.2s ease;
  }

  @keyframes page-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;