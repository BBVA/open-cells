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

import { ReplaySubject } from 'rxjs';
import { WCEvent } from '../manager/events';

export interface Channel extends ReplaySubject<PublishableValue> {
  /**
   * The name of the channel.
   */
  readonly name: string;

  /**
   * Sends the next value to the channel. If the value does not have a UUID, it generates one. If
   * the value does not have a time, it sets the current time.
   *
   * @param {PublishableValue} value - The value to be sent to the channel.
   */
  next(value: PublishableValue): void;

  /**
   * Checks if the channel has any observers.
   *
   * @returns {boolean} True if the channel has observers, false otherwise.
   * @throws {Error} If the channel is closed.
   */
  hasObservers(): boolean;

  /**
   * Unsubscribes all observers from the channel.
   *
   * @returns {void}
   */
  unsubscribeAllObservers(): void;

  /**
   * Cleans the channel by resetting the buffer and observers.
   */
  clean(): void;

  /**
   * Gets the internal buffer of the channel.
   * 
   * **Note:** This property should not be directly modified. Use the `next` method to send values to the channel.
   */
  readonly buffer: PublishableValue[];
}


export type PublishableValue = WCEvent & {
  uuid?: string;
  time?: number;
};
