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

import { Observer, Subscription, TeardownLogic } from "rxjs";
import { Channel } from "./channel";
import { WCNode } from "../component-connector";
import { PublishableValue } from "./channel";

export type CallBackFunction = Function &
  Partial<Observer<PublishableValue>>

export type AugmentedFunction = CallBackFunction 

export type NodeChannelRecord = {
  [index: string]: { 
    interval: number | null, 
    id: string | null
  }
}
export type Binding = string | Function;

export type WCSubscriptionDetail = {
  channel: Channel;
  bind: Binding;
  node: WCNode;
  subscription: WCSubscription;
};

export type WrappedEventForPublication = TeardownLogic;

export interface WCSubscription extends Subscription {
  node?: WCNode;
  _subscriptions?: WCSubscription[];
  channel?: Channel;
  channelName?: string;
  eventName?: string;
  options?: { [index: string]: any }
}

