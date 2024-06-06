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

export default css`
  [data-cells-page] {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  [data-cells-page][state='active'],
  [data-cells-page][state='inactive'][page-animation] {
    display: block;
  }

  [data-cells-page][state='inactive'] {
    z-index: 2;
  }

  [data-cells-page][state='active'] {
    z-index: 3;
  }

  [data-cells-page][page-animation] {
    animation-duration: var(--page-transition-animation-duration, 195ms);
    animation-timing-function: var(
      --page-transition-animation-timing-function,
      cubic-bezier(0.4, 0, 0.2, 1)
    );
    animation-fill-mode: both;
    animation-name: base-cells-page;
  }

  /* fade */
  [data-cells-page][page-animation='fadeIn'] {
    animation-name: fadeIn;
  }

  [data-cells-page][page-animation='fadeOut'] {
    animation-name: fadeOut;
  }

  /* static */
  [data-cells-page][page-animation='static'] {
    z-index: 0 !important;
    animation-name: static;
    animation-duration: 0s;
  }

  /* horizontal */
  [data-cells-page][page-animation='moveFromRight'] {
    animation-name: moveFromRight;
  }

  [data-cells-page][page-animation='moveToLeft'] {
    animation-name: moveToLeft;
  }

  [data-cells-page][page-animation='moveFromLeft'] {
    animation-name: moveFromLeft;
  }

  [data-cells-page][page-animation='moveToRight'] {
    animation-name: moveToRight;
  }

  /*vertical*/
  [data-cells-page][page-animation='moveFromBottom'] {
    animation-name: moveFromBottom;
  }

  [data-cells-page][page-animation='moveToTop'] {
    animation-name: moveToTop;
  }

  [data-cells-page][page-animation='moveFromTop'] {
    animation-name: moveFromTop;
  }

  [data-cells-page][page-animation='moveToBottom'] {
    animation-name: moveToBottom;
  }

  @keyframes base-cells-page {
  }

  /* fade key*/
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  /* static key*/
  @keyframes static {
    from {
      transform: translateZ(0);
    }
    to {
      transform: translateZ(0);
    }
  }

  /* horizontal key*/
  @keyframes moveFromRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: initial;
    }
  }

  @keyframes moveToLeft {
    from {
      transform: initial;
    }
    to {
      transform: translateX(-32%);
    }
  }

  @keyframes moveFromLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: initial;
    }
  }

  @keyframes moveToRight {
    from {
      transform: initial;
    }
    to {
      transform: translateX(32%);
    }
  }

  /*vertical key*/
  @keyframes moveFromBottom {
    from {
      transform: translateY(100%);
    }
    to {
      transform: initial;
    }
  }

  @keyframes moveToTop {
    from {
      transform: initial;
    }
    to {
      transform: translateY(-100%);
    }
  }

  @keyframes moveFromTop {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: initial;
    }
  }

  @keyframes moveToBottom {
    from {
      transform: initial;
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0.96;
    }
  }
`;
