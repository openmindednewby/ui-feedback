import {
  notifyWarming,
  settleWarming,
  subscribeWarming,
  getWarmingSnapshot,
  WARMING_QUIET_PERIOD_MS,
} from './warmingStore';

describe('warmingStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    settleWarming(); // reset the module-level singleton between tests
  });

  afterEach(() => {
    settleWarming();
    jest.useRealTimers();
  });

  it('starts idle', () => {
    expect(getWarmingSnapshot()).toEqual({ isWarming: false, attempt: 0 });
  });

  it('marks warming and records the attempt on notify', () => {
    notifyWarming({ attempt: 1, maxRetries: 3, status: 503 });
    expect(getWarmingSnapshot()).toEqual({ isWarming: true, attempt: 1 });
  });

  it('notifies subscribers on the warming transition', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeWarming(listener);
    notifyWarming({ attempt: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    notifyWarming({ attempt: 1 }); // same attempt, already unsubscribed
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('auto-settles after the quiet period elapses', () => {
    notifyWarming({ attempt: 1 });
    expect(getWarmingSnapshot().isWarming).toBe(true);

    jest.advanceTimersByTime(WARMING_QUIET_PERIOD_MS - 1);
    expect(getWarmingSnapshot().isWarming).toBe(true);

    jest.advanceTimersByTime(1);
    expect(getWarmingSnapshot()).toEqual({ isWarming: false, attempt: 0 });
  });

  it('keeps warming and updates the attempt while notifies keep arriving', () => {
    notifyWarming({ attempt: 1 });

    jest.advanceTimersByTime(WARMING_QUIET_PERIOD_MS - 1);
    notifyWarming({ attempt: 2 }); // resets the quiet timer
    expect(getWarmingSnapshot()).toEqual({ isWarming: true, attempt: 2 });

    jest.advanceTimersByTime(WARMING_QUIET_PERIOD_MS - 1);
    notifyWarming({ attempt: 3 });
    expect(getWarmingSnapshot()).toEqual({ isWarming: true, attempt: 3 });

    // Only after a full quiet period with no notify does it settle.
    jest.advanceTimersByTime(WARMING_QUIET_PERIOD_MS);
    expect(getWarmingSnapshot().isWarming).toBe(false);
  });

  it('settleWarming force-clears before the quiet period and cancels the timer', () => {
    const listener = jest.fn();
    subscribeWarming(listener);
    notifyWarming({ attempt: 1 });
    listener.mockClear();

    settleWarming();
    expect(getWarmingSnapshot()).toEqual({ isWarming: false, attempt: 0 });
    expect(listener).toHaveBeenCalledTimes(1);

    // The previously scheduled auto-settle must not fire (no double emit).
    jest.advanceTimersByTime(WARMING_QUIET_PERIOD_MS);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('settleWarming is a no-op when already idle', () => {
    const listener = jest.fn();
    subscribeWarming(listener);
    settleWarming();
    expect(listener).not.toHaveBeenCalled();
  });

  it('returns a stable snapshot identity until the value changes', () => {
    const first = getWarmingSnapshot();
    notifyWarming({ attempt: 1 });
    const afterNotify = getWarmingSnapshot();
    expect(afterNotify).not.toBe(first);
    // A repeated notify with the SAME attempt does not churn the snapshot.
    notifyWarming({ attempt: 1 });
    expect(getWarmingSnapshot()).toBe(afterNotify);
  });

  it('exposes the quiet period as a positive constant', () => {
    expect(WARMING_QUIET_PERIOD_MS).toBeGreaterThan(0);
  });
});
