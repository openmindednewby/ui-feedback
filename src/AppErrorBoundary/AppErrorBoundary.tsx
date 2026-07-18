/**
 * AppErrorBoundary — the shared top-level React error boundary, promoted from the
 * SIX app-local copies (agora-web + zygos-web byte-identical, kefi-web, erevna-web,
 * katalogos-web, ichnos-web). aml-v2 had none at all.
 *
 * What varied between the copies — and is therefore injected, not baked in:
 *  - **reporting**   → `onError` (Sentry `captureException` / `loggingService.fatal`)
 *  - **recovery**    → `recover` (the apps' `isChunkLoadError() && attemptChunkRecovery()`)
 *  - **test ids**    → `testIDPrefix` (defaults to the value all six already used)
 *  - **error text**  → `showDetails` (the dev-only stack block)
 *  - **wording**     → `labels` (pre-localized by the caller; the kit imports no i18n)
 *  - **everything else** → `fallback`, the escape hatch
 *
 * What is now uniform: the fallback renders through the shared `<ErrorState>`, so
 * it themes from `UiProvider` instead of the Bootstrap-4 hex literals three copies
 * hardcoded; and it announces via `role="alert"` + `accessibilityLiveRegion`,
 * which none of the six did.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorBoundaryFallback } from './ErrorBoundaryFallback';
import { ErrorBoundaryRecovering } from './ErrorBoundaryRecovering';
import { type ErrorBoundaryLabels } from './labels';
import { resolveLabels, resolveRetryable, resolveShowDetails } from './resolve';
import { FEEDBACK_TEST_IDS } from '../constants';

/** What the `fallback` render-prop receives. */
export interface ErrorFallbackState {
  /** The caught error, or `null` before anything has been caught. */
  error: Error | null;
  /** True while the caller's `recover` is handling the error. */
  recovering: boolean;
  /** Resets the boundary and re-renders `children`. */
  retry: () => void;
}

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Reporting sink — Sentry / logger. Called for EVERY caught error, before `recover`. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * Recovery attempt. Return `true` if the error is handled (e.g. a guarded page
   * reload is under way) — the boundary then shows the `updating` screen instead
   * of the error screen. Return `false`/omit to fall through to the fallback.
   */
  recover?: (error: Error) => boolean;
  /**
   * Render the error message in the fallback (dev-only stack). Default `false`.
   *
   * A predicate is asked per caught error, so an app can suppress the block for
   * error classes where the stack is noise rather than signal (the three chunk-aware
   * apps hide it for a stale-chunk failure: the message names a hashed filename the
   * user can do nothing with). A plain boolean behaves exactly as it always has.
   */
  showDetails?: boolean | ((error: Error) => boolean);
  /** Pre-localized wording. Anything omitted falls back to the English defaults. */
  labels?: Partial<ErrorBoundaryLabels>;
  /**
   * Per-error wording, merged OVER `labels`. Lets a caller say something specific
   * about a specific failure ("Update available" for a stale chunk) without the kit
   * knowing why — it never sees the classification, only the resulting strings.
   */
  labelsFor?: (error: Error) => Partial<ErrorBoundaryLabels>;
  /**
   * Whether retrying could plausibly help. When this returns `false` the retry
   * action is NOT rendered at all — offering a button that re-renders straight back
   * into the same failure is worse than offering nothing. Default: every error is
   * retryable, which is the behaviour before this prop existed.
   */
  retryable?: (error: Error) => boolean;
  /**
   * Called from `componentDidMount` ONLY when the mount was clean (nothing caught).
   * The chunk-aware apps use it to release their one-shot reload guard: a clean mount
   * proves the current chunks loaded, so a FUTURE deploy is allowed to auto-recover
   * again. Deliberately NOT called on an errored mount — that would re-arm the guard
   * during the very failure it is meant to bound, and reintroduce the reload loop.
   */
  onMount?: () => void;
  /**
   * Give the primary (filled) emphasis — and the first position — to **Reload**
   * instead of **Try Again**. Default `false`, which preserves the emphasis every
   * existing caller renders today.
   *
   * Apps with a stale-chunk failure mode set this: when the running bundle references
   * a chunk that no longer exists, reloading is the action that actually works and
   * re-rendering is the one that cannot.
   */
  reloadIsPrimary?: boolean;
  /** Prefix for every testID the boundary renders. Default `error-boundary`. */
  testIDPrefix?: string;
  /** Full escape hatch — replaces the built-in fallback entirely. */
  fallback?: (state: ErrorFallbackState) => ReactNode;
  /**
   * Optional secondary action: a full page reload. Rendered only when provided.
   * (kefi/erevna/katalogos shipped a manual **Reload** alongside **Try Again**;
   * the kit does not touch `window`, so the caller injects the reload itself.)
   */
  onReload?: () => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  recovering: boolean;
}

const INITIAL_STATE: AppErrorBoundaryState = { hasError: false, error: null, recovering: false };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = INITIAL_STATE;
  }

  public static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidMount(): void {
    // Only a CLEAN mount. On an errored mount React still runs componentDidMount
    // (after the fallback renders) with `hasError` already true — firing there would
    // defeat any one-shot guard the caller is releasing here.
    const isCleanMount = !this.state.hasError;
    if (isCleanMount && typeof this.props.onMount === 'function') this.props.onMount();
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    // Report FIRST — every copy reported unconditionally, recovery or not.
    if (typeof this.props.onError === 'function') this.props.onError(error, info);

    const isHandled = typeof this.props.recover === 'function' && this.props.recover(error);
    if (isHandled) this.setState({ recovering: true });
  }

  private readonly handleRetry = (): void => {
    this.setState(INITIAL_STATE);
  };

  public render(): ReactNode {
    const { children, fallback, labels, labelsFor, showDetails, onReload } = this.props;
    const { hasError, error, recovering } = this.state;
    const testIDPrefix = this.props.testIDPrefix ?? FEEDBACK_TEST_IDS.errorBoundary;
    const resolvedLabels: ErrorBoundaryLabels = resolveLabels(labels, labelsFor, error);

    if (!hasError) return children;

    if (typeof fallback === 'function') return fallback({ error, recovering, retry: this.handleRetry });

    if (recovering)
      return (
        <ErrorBoundaryRecovering message={resolvedLabels.updating} testID={`${testIDPrefix}-updating`} />
      );

    return (
      <ErrorBoundaryFallback
        error={error}
        labels={resolvedLabels}
        reloadIsPrimary={this.props.reloadIsPrimary === true}
        showDetails={resolveShowDetails(showDetails, error)}
        showRetry={resolveRetryable(this.props.retryable, error)}
        testIDPrefix={testIDPrefix}
        onReload={onReload}
        onRetry={this.handleRetry}
      />
    );
  }
}

export default AppErrorBoundary;
