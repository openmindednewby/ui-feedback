/** Semi-transparent scrim behind modal dialogs. */
export const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

/** Opacity applied to disabled interactive controls. */
export const DISABLED_OPACITY = 0.5;

/**
 * Default testID strings. These match the values the consuming apps already used
 * so existing Playwright selectors keep working after migration.
 */
export const FEEDBACK_TEST_IDS = {
  errorState: 'error-state',
  errorStateRetry: 'error-state-retry',
  emptyListCta: 'empty-list-cta',
  loadingFallback: 'loading-fallback',
  pageSkeleton: 'page-skeleton',
  confirmDialog: 'confirm-dialog',
  confirmButton: 'confirm-button',
  cancelConfirmButton: 'cancel-confirm-button',
} as const;
