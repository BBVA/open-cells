import { WCEvent } from '../manager/events';

export { Channel } from "../../src/state/channel";

export type PublishableValue = WCEvent & {
  uuid?: string;
  time?: number;
};
