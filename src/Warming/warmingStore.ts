/**
 * warmingStore — a tiny, framework-agnostic (no React) store for the cold-start
 * "warming up…" UX (Move 3a).
 *
 * On a resource-tight, scale-to-zero prod node the BFF/upstream can be cold on the
 * FIRST request after idle. `@dloizides/bff-web-client`'s `warmupRetryInterceptor`
 * transparently retries the 502/503/504 and fires `onWarmupRetry({ attempt, … })`
 * per retry — but it has NO "recovered" signal (it only fires on retries, never on
 * the eventual success). So an app wires its `onWarmupRetry` to `notifyWarming(...)`
 * here, and this store AUTO-SETTLES `isWarming` back to false after a quiet period
 * with no new notify (i.e. the request finally succeeded and retries stopped).
 *
 * Shaped for React's `useSyncExternalStore`: `subscribeWarming` + `getWarmingSnapshot`
 * (the snapshot object identity only changes when the value changes, so no render loop).
 * SSR/no-DOM safe (timer is guarded, no `window`) and deterministic (no `Date.now()` /
 * `Math.random()`).
 */

/**
 * How long (ms) the store stays "warming" after the LAST `notifyWarming` before it
 * auto-clears. Sized a touch above the interceptor's largest backoff so a genuine
 * retry storm keeps the overlay up, but a recovered request lets it settle.
 */
export const WARMING_QUIET_PERIOD_MS = 2500;

/** What an app forwards from the interceptor's `onWarmupRetry` callback. */
export interface WarmingInfo {
  attempt: number;
  maxRetries?: number;
  status?: number;
}

/** Immutable snapshot read by `useSyncExternalStore`. */
export interface WarmingSnapshot {
  isWarming: boolean;
  attempt: number;
}

type WarmingListener = () => void;

const IDLE_ATTEMPT = 0;

let warming = false;
let currentAttempt = IDLE_ATTEMPT;
let snapshot: WarmingSnapshot = { isWarming: false, attempt: IDLE_ATTEMPT };

const listeners = new Set<WarmingListener>();
let quietTimer: ReturnType<typeof setTimeout> | undefined;

function refreshSnapshot(): void {
  snapshot = { isWarming: warming, attempt: currentAttempt };
}

function emit(): void {
  for (const listener of listeners) listener();
}

function clearQuietTimer(): void {
  if (quietTimer !== undefined) {
    clearTimeout(quietTimer);
    quietTimer = undefined;
  }
}

function scheduleSettle(): void {
  clearQuietTimer();
  // SSR / no-DOM guard: environments without a real timer just stay warming until
  // an explicit settleWarming() (or never render the overlay at all).
  if (typeof setTimeout !== 'function') return;
  quietTimer = setTimeout(() => {
    quietTimer = undefined;
    settleWarming();
  }, WARMING_QUIET_PERIOD_MS);
}

/**
 * Mark the store "warming" and record the latest retry attempt. Resets the
 * auto-settle timer, so as long as retries keep arriving the overlay stays up.
 * Call this from an app's `onWarmupRetry`.
 */
export function notifyWarming(info: WarmingInfo): void {
  const changed = !warming || currentAttempt !== info.attempt;
  warming = true;
  currentAttempt = info.attempt;
  scheduleSettle();
  if (changed) {
    refreshSnapshot();
    emit();
  }
}

/**
 * Force-clear the warming state (for tests, or to wire an explicit success signal
 * later). Also cancels any pending auto-settle timer. No-op when already idle.
 */
export function settleWarming(): void {
  clearQuietTimer();
  if (!warming) return;
  warming = false;
  currentAttempt = IDLE_ATTEMPT;
  refreshSnapshot();
  emit();
}

/** Register a listener; returns an unsubscribe. Shaped for `useSyncExternalStore`. */
export function subscribeWarming(listener: WarmingListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current immutable snapshot. Stable identity until the value changes. */
export function getWarmingSnapshot(): WarmingSnapshot {
  return snapshot;
}
