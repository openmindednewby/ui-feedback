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
import { DEFAULT_ERROR_BOUNDARY_LABELS, type ErrorBoundaryLabels } from './labels';
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
  /** Render the error message in the fallback (dev-only stack). Default `false`. */
  showDetails?: boolean;
  /** Pre-localized wording. Anything omitted falls back to the English defaults. */
  labels?: Partial<ErrorBoundaryLabels>;
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
    const { children, fallback, labels, showDetails = false, onReload } = this.props;
    const { hasError, error, recovering } = this.state;
    const testIDPrefix = this.props.testIDPrefix ?? FEEDBACK_TEST_IDS.errorBoundary;
    const resolvedLabels: ErrorBoundaryLabels = { ...DEFAULT_ERROR_BOUNDARY_LABELS, ...labels };

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
        showDetails={showDetails}
        testIDPrefix={testIDPrefix}
        onReload={onReload}
        onRetry={this.handleRetry}
      />
    );
  }
}

export default AppErrorBoundary;
