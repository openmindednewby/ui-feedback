/**
 * Unit tests for createToastBus — the framework-agnostic emit half.
 *
 * The load-bearing guarantees: it works with NO React in scope, `subscribe`
 * returns a working unsubscribe, every subscriber gets every emit, and a
 * listener that unsubscribes DURING an emit cannot corrupt the iteration.
 */
import { createToastBus, type ToastPush } from './createToastBus';
import type { ToastInput } from '../ToastHost/ToastHost';

function collector(): { push: ToastPush; seen: ToastInput[] } {
  const seen: ToastInput[] = [];
  return { push: (toast) => seen.push(toast), seen };
}

describe('createToastBus', () => {
  it('delivers an emitted toast to a subscriber', () => {
    const bus = createToastBus();
    const a = collector();

    bus.subscribe(a.push);
    bus.emit('saved', 'success');

    expect(a.seen).toEqual([{ text: 'saved', type: 'success' }]);
  });

  it('defaults the type to info when emit is called without one', () => {
    const bus = createToastBus();
    const a = collector();

    bus.subscribe(a.push);
    bus.emit('heads up');

    expect(a.seen).toEqual([{ text: 'heads up', type: 'info' }]);
  });

  it('maps success/error/info helpers to the right toast type', () => {
    const bus = createToastBus();
    const a = collector();

    bus.subscribe(a.push);
    bus.success('yay');
    bus.error('boom');
    bus.info('fyi');

    expect(a.seen).toEqual([
      { text: 'yay', type: 'success' },
      { text: 'boom', type: 'error' },
      { text: 'fyi', type: 'info' },
    ]);
  });

  it('fans a single emit out to EVERY subscriber', () => {
    const bus = createToastBus();
    const a = collector();
    const b = collector();

    bus.subscribe(a.push);
    bus.subscribe(b.push);
    bus.error('down');

    expect(a.seen).toEqual([{ text: 'down', type: 'error' }]);
    expect(b.seen).toEqual([{ text: 'down', type: 'error' }]);
  });

  it('stops delivering after the returned unsubscribe is called', () => {
    const bus = createToastBus();
    const a = collector();

    const unsubscribe = bus.subscribe(a.push);
    bus.info('first');
    unsubscribe();
    bus.info('second');

    expect(a.seen).toEqual([{ text: 'first', type: 'info' }]);
  });

  it('unsubscribing one listener leaves the others subscribed', () => {
    const bus = createToastBus();
    const a = collector();
    const b = collector();

    const unsubscribeA = bus.subscribe(a.push);
    bus.subscribe(b.push);
    unsubscribeA();
    bus.info('after');

    expect(a.seen).toHaveLength(0);
    expect(b.seen).toHaveLength(1);
  });

  it('is safe when a listener unsubscribes DURING an emit', () => {
    const bus = createToastBus();
    const b = collector();

    const unsubscribeA: () => void = bus.subscribe(() => {
      unsubscribeA();
    });
    bus.subscribe(b.push);

    expect(() => bus.info('mid-flight')).not.toThrow();
    // The other listener still received this emit...
    expect(b.seen).toHaveLength(1);
    // ...and the self-removing one is gone for the next.
    bus.info('next');
    expect(b.seen).toHaveLength(2);
  });

  it('emitting with no subscribers is a silent no-op (host not mounted yet)', () => {
    const bus = createToastBus();

    expect(() => bus.success('nobody listening')).not.toThrow();
  });

  it('gives each bus instance its own isolated listener set', () => {
    const busOne = createToastBus();
    const busTwo = createToastBus();
    const a = collector();

    busOne.subscribe(a.push);
    busTwo.info('other bus');

    expect(a.seen).toHaveLength(0);
  });

  it('exposes a subscribe reference that is stable for the life of the bus', () => {
    const bus = createToastBus();

    // <ToastHost> uses `subscribe` as a useEffect dependency — an unstable
    // reference would resubscribe on every render.
    expect(bus.subscribe).toBe(bus.subscribe);
  });
});
