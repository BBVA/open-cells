export interface IWCEvent extends Event {
  detail?: any;
}

export type WCEvent = IWCEvent | CustomEvent;