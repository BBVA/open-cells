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

export default {
  static: {
    forwardsIn: 'static',
    forwardsOut: 'static',
    backwardsIn: 'static',
    backwardsOut: 'static',
  },
  fade: {
    forwardsIn: 'fadeIn',
    forwardsOut: 'fadeOut',
    backwardsIn: 'fadeIn',
    backwardsOut: 'fadeOut',
  },
  horizontal: {
    forwardsIn: 'moveFromRight',
    forwardsOut: 'moveToLeft',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  horizontalEverForwards: {
    forwardsIn: 'moveFromRight',
    forwardsOut: 'moveToLeft',
    backwardsIn: 'moveFromRight',
    backwardsOut: 'moveToLeft',
  },
  horizontalEverBackwards: {
    forwardsIn: 'moveFromLeft',
    forwardsOut: 'moveToRight',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  verticalDownForwards: {
    forwardsIn: 'static',
    forwardsOut: 'moveToBottom',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  verticalDownBackwards: {
    forwardsIn: 'moveFromRight',
    forwardsOut: 'moveToLeft',
    backwardsIn: 'static',
    backwardsOut: 'moveToBottom',
  },
  verticalUpForwards: {
    forwardsIn: 'moveFromBottom',
    forwardsOut: 'static',
    backwardsIn: 'moveFromLeft',
    backwardsOut: 'moveToRight',
  },
  verticalUp: {
    forwardsIn: 'moveFromBottom',
    forwardsOut: 'static',
    backwardsIn: 'static',
    backwardsOut: 'moveToBottom',
  },
};
