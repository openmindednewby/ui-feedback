/**
 * createToastBus — the shared EMIT half of the toast pipeline, promoted from the
 * hand-rolled twins in aml-v2 (`components/toast.ts`), agora-web and zygos-web
 * (`lib/toastBus.ts`). The RENDERING half is `<ToastHost>`; a bus instance's
 * {@link ToastBus.subscribe} IS the `ToastHost` `subscribe` port.
 *
 * Deliberately FRAMEWORK-AGNOSTIC — no React import, no hook, no provider. Call
 * sites are React Query mutation `onSuccess`/`onError` callbacks that have no
 * component context in scope, so a hook-based API would break every one of them.
 *
 * It carries no styling: `<ToastHost>` themes every toast from `UiProvider`.
 * Text arriving here is ALREADY localized by the caller (`FM()`); this bus never
 * sees a translation key.
 *
 * Usage — one module-level instance per app:
 * ```ts
 * // src/lib/toastBus.ts
 * import { createToastBus } from '@dloizides/ui-feedback';
 * export const toastBus = createToastBus();
 *
 * // anywhere, no provider needed:
 * toastBus.success(FM('menu.saved'));
 *
 * // once, in the shell:
 * <ToastHost subscribe={toastBus.subscribe} />
 * ```
 */
import type { ToastInput, ToastType } from '../ToastHost/ToastHost';

/** A registered push callback — what `<ToastHost>` hands to {@link ToastBus.subscribe}. */
export type ToastPush = (toast: ToastInput) => void;

export interface ToastBus {
  /** Register a push callback; returns an unsubscribe. The `<ToastHost>` `subscribe` port. */
  subscribe(push: ToastPush): () => void;
  /** Emit a toast of an explicit type. Defaults to `info`. */
  emit(text: string, type?: ToastType): void;
  /** Emit a success toast. */
  success(text: string): void;
  /** Emit an error toast. */
  error(text: string): void;
  /** Emit an informational toast. */
  info(text: string): void;
}

const DEFAULT_TOAST_TYPE: ToastType = 'info';

/**
 * Create an independent toast bus. Emitting with no subscriber is a silent no-op
 * (the host simply isn't mounted yet), and every subscriber receives every emit.
 */
export function createToastBus(): ToastBus {
  const listeners = new Set<ToastPush>();

  const emit = (text: string, type: ToastType = DEFAULT_TOAST_TYPE): void => {
    // Iterate a snapshot so a listener that unsubscribes (or subscribes) while
    // handling a toast cannot mutate the set mid-iteration.
    for (const push of [...listeners]) push({ text, type });
  };

  return {
    subscribe(push: ToastPush): () => void {
      listeners.add(push);
      return (): void => {
        listeners.delete(push);
      };
    },
    emit,
    success(text: string): void {
      emit(text, 'success');
    },
    error(text: string): void {
      emit(text, 'error');
    },
    info(text: string): void {
      emit(text, 'info');
    },
  };
}

export default createToastBus;
