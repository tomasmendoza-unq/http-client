type SessionExpiredListener = () => void;

let listener: SessionExpiredListener | undefined;

export function onSessionExpired(fn: SessionExpiredListener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = undefined;
  };
}

export function notifySessionExpired(): void {
  listener?.();
}
