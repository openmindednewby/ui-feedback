/**
 * Per-error resolution helpers for `<AppErrorBoundary>`.
 *
 * These exist so the boundary can vary its wording, its details block and whether
 * a retry is even offered BY ERROR CLASS — without the kit ever learning what an
 * error class *is*. The caller classifies; the kit only consumes the verdict.
 *
 * Kept as module-level pure functions (rather than inline in `render`) so `render`
 * stays a readable branch table and each rule is unit-testable on its own.
 */
import { DEFAULT_ERROR_BOUNDARY_LABELS, type ErrorBoundaryLabels } from './labels';

/** Static `labels`, then any per-error overrides from `labelsFor`, over the defaults. */
export function resolveLabels(
  labels: Partial<ErrorBoundaryLabels> | undefined,
  labelsFor: ((error: Error) => Partial<ErrorBoundaryLabels>) | undefined,
  error: Error | null,
): ErrorBoundaryLabels {
  const perError = typeof labelsFor === 'function' && error !== null ? labelsFor(error) : {};
  return { ...DEFAULT_ERROR_BOUNDARY_LABELS, ...labels, ...perError };
}

/**
 * A plain boolean behaves exactly as it always has (back-compat); a predicate is
 * asked about the specific error. With no error there is nothing to detail.
 */
export function resolveShowDetails(
  showDetails: boolean | ((error: Error) => boolean) | undefined,
  error: Error | null,
): boolean {
  if (typeof showDetails === 'function') return error !== null && showDetails(error);
  return showDetails === true;
}

/**
 * Whether re-rendering the children could plausibly help. Default: every error is
 * retryable — which is what the kit did before `retryable` existed.
 */
export function resolveRetryable(
  retryable: ((error: Error) => boolean) | undefined,
  error: Error | null,
): boolean {
  if (typeof retryable !== 'function' || error === null) return true;
  return retryable(error);
}
