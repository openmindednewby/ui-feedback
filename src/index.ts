// Context / provider
export {
  FeedbackUiProvider,
  useFeedbackUi,
} from './context/FeedbackUiContext';
export type {
  FeedbackTheme,
  FeedbackThemeColors,
  FeedbackThemePalette,
  FeedbackThemeSemantic,
  FeedbackColorScale,
  FeedbackTranslate,
  FeedbackNavigate,
  FeedbackUiValue,
  FeedbackUiProviderProps,
} from './context/FeedbackUiContext';

// Neutral aliases — ui-feedback is the shared UI context for the whole kit.
// Sibling kit packages (ui-forms, ui-tables, …) and apps can use these names
// instead of the feedback-specific ones; they reference the same context.
export {
  FeedbackUiProvider as UiProvider,
  useFeedbackUi as useUi,
} from './context/FeedbackUiContext';
export type {
  FeedbackTheme as UiTheme,
  FeedbackThemeColors as UiThemeColors,
  FeedbackThemePalette as UiThemePalette,
  FeedbackThemeSemantic as UiThemeSemantic,
  FeedbackColorScale as UiColorScale,
  FeedbackTranslate as UiTranslate,
  FeedbackNavigate as UiNavigate,
  FeedbackUiValue as UiValue,
  FeedbackUiProviderProps as UiProviderProps,
} from './context/FeedbackUiContext';

// Shared constants
export { MODAL_OVERLAY_COLOR, DISABLED_OPACITY, FEEDBACK_TEST_IDS } from './constants';

// Components
export { ErrorState } from './ErrorState/ErrorState';
export type { ErrorStateProps } from './ErrorState/ErrorState';

export { EmptyListState } from './EmptyListState/EmptyListState';
export type { EmptyListStateProps } from './EmptyListState/EmptyListState';

export { LoadingFallback } from './LoadingFallback/LoadingFallback';
export type { LoadingFallbackProps } from './LoadingFallback/LoadingFallback';

export { PageSkeleton } from './PageSkeleton/PageSkeleton';
export type { PageSkeletonProps } from './PageSkeleton/PageSkeleton';

export { ConfirmDialog } from './ConfirmDialog/ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog/ConfirmDialog';

export { ToastHost } from './ToastHost/ToastHost';
export type { ToastHostProps, ToastInput, ToastType } from './ToastHost/ToastHost';

// Cold-start "warming up…" overlay (Move 3a)
export { WarmingOverlay } from './Warming/WarmingOverlay';
export type { WarmingOverlayProps, WarmingOverlayLabels } from './Warming/WarmingOverlay';
export {
  notifyWarming,
  settleWarming,
  subscribeWarming,
  getWarmingSnapshot,
  WARMING_QUIET_PERIOD_MS,
} from './Warming/warmingStore';
export type { WarmingInfo, WarmingSnapshot } from './Warming/warmingStore';

// Framework-agnostic toast emit bus (W1.2). Pairs with <ToastHost>: a bus's
// `subscribe` IS the host's `subscribe` port. No React — safe to call from a
// mutation callback with no provider in scope.
export { createToastBus } from './toastBus/createToastBus';
export type { ToastBus, ToastPush } from './toastBus/createToastBus';

// Shared top-level error boundary (W1.3). Themes through UiProvider via <ErrorState>.
export { AppErrorBoundary } from './AppErrorBoundary/AppErrorBoundary';
export type { AppErrorBoundaryProps, ErrorFallbackState } from './AppErrorBoundary/AppErrorBoundary';
export { DEFAULT_ERROR_BOUNDARY_LABELS } from './AppErrorBoundary/labels';
export type { ErrorBoundaryLabels } from './AppErrorBoundary/labels';
