// Global type declarations for browser APIs

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}

interface IdleRequestOptions {
  timeout?: number;
}

interface Window {
  requestIdleCallback(
    callback: (deadline: IdleDeadline) => void,
    options?: IdleRequestOptions
  ): number;
  cancelIdleCallback(handle: number): void;
}

declare function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: IdleRequestOptions
): number;

declare function cancelIdleCallback(handle: number): void;

declare function queueMicrotask(callback: () => void): void;
