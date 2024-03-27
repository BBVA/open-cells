import { Observer, Subscription, TeardownLogic } from "rxjs";
import { Channel } from "../../src/state/channel";
import { WCNode, OutConnection } from "../component-connector";
import { PublishableValue } from "./channel";

export type CallBackFunction = Function &
  Partial<Observer<PublishableValue>>

// export type AugmentedFunction = CallBackFunction & {
//   node: WCNode;
// };

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

