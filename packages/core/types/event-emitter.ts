export declare class EventEmitter {
  on(event: string, listener: Function): void;
  once(event: string, listener: Function): void;
  off(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
}