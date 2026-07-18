/**
 * The i18n-agnostic label bag for `<AppErrorBoundary>`.
 *
 * The kit imports no `FM`/i18n runtime — callers localize at the call site and
 * pass PRE-LOCALIZED strings (`labels={{ title: FM('errorBoundary.title') }}`).
 * The defaults below are plain English so the boundary is never blank when a
 * caller omits the bag.
 */
export interface ErrorBoundaryLabels {
  /** Heading of the error screen. */
  title: string;
  /** Body copy under the heading. */
  message: string;
  /** Primary action: reset the boundary and re-render the children. */
  tryAgain: string;
  /** Accessibility hint for the try-again action. */
  tryAgainHint: string;
  /** Secondary action: full page reload (rendered only when `onReload` is given). */
  reload: string;
  /** Accessibility hint for the reload action. */
  reloadHint: string;
  /** Shown while `recover` is handling the error (e.g. a guarded chunk reload). */
  updating: string;
  /** Heading of the dev-only error-details block. */
  errorDetails: string;
}

export const DEFAULT_ERROR_BOUNDARY_LABELS: ErrorBoundaryLabels = {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again.',
  tryAgain: 'Try again',
  tryAgainHint: 'Retries rendering this screen',
  reload: 'Reload',
  reloadHint: 'Reloads the application',
  updating: 'Updating…',
  errorDetails: 'Error details',
};
