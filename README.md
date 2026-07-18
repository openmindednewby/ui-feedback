# @dloizides/ui-feedback

Themable, brand-agnostic React Native (RN-web) **feedback** components for the
dloizides.com portfolio. The components read theme colours and translated copy from
a small injectable provider, so each app supplies its own theme + i18n without the
package depending on any app's internals.

## Components

| Component | Purpose |
|-----------|---------|
| `ErrorState` | Generic error message with an optional retry button. |
| `EmptyListState` | Empty-collection message with an optional navigating call-to-action. |
| `LoadingFallback` | Lightweight spinner for `React.lazy` / `Suspense` boundaries. |
| `PageSkeleton` | Shimmer skeleton for full-page loads (list or card variant). |
| `ConfirmDialog` | Modal confirm/cancel dialog with destructive + loading states. |
| `ToastHost` | Transient-toast overlay; pair it with `createToastBus()`. |
| `WarmingOverlay` | Branded cold-start "warming up…" overlay. |
| `AppErrorBoundary` | Top-level error boundary with a themed, announced fallback. |

## Helpers

| Helper | Purpose |
|--------|---------|
| `createToastBus()` | Framework-agnostic toast emit bus — the `ToastHost` `subscribe` port. |

## Install

```bash
npm install @dloizides/ui-feedback
```

Peer dependencies: `react >= 18`, `react-native >= 0.74` (use `react-native-web` on web).

## Setup

Mount `FeedbackUiProvider` once, high in your tree, **below** your app's own theme
provider. Adapt your local `useTheme()` + translate helper to the provider:

```tsx
import { FeedbackUiProvider } from '@dloizides/ui-feedback';
import { useRouter } from 'expo-router';
import { FM } from './localization/helpers';
import { useTheme } from './theme/hooks/useTheme';

const FeedbackUiAdapter = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <FeedbackUiProvider theme={theme} t={FM} navigate={(route) => router.push(route)}>
      {children}
    </FeedbackUiProvider>
  );
};
```

The injected `theme` only needs `colors.{background,surfaceElevated,text,textSecondary,border}`,
`palette.primary['500']` and `semantic.error['500']` — any resolved theme with those
fields is structurally compatible.

## Usage

```tsx
import { ErrorState, ConfirmDialog, LoadingFallback } from '@dloizides/ui-feedback';

<ErrorState message="Could not load data" onRetry={refetch} />
<LoadingFallback fullScreen />
<ConfirmDialog
  visible={open}
  title="Delete item?"
  message="This cannot be undone."
  destructive
  onConfirm={onDelete}
  onCancel={() => setOpen(false)}
/>
```

## Toasts — `createToastBus()`

The toast pipeline is two halves: `createToastBus()` **emits**, `<ToastHost>` **renders**.
A bus's `subscribe` *is* the host's `subscribe` port.

The bus is **framework-agnostic on purpose** — no React import, no hook, no provider — so a
React Query mutation callback can raise a toast with no component context in scope. It carries
no styling (`ToastHost` themes every toast from the provider), and the text you pass is already
localized by you; the bus never sees a translation key.

```ts
// src/lib/toastBus.ts — one module-level instance per app
import { createToastBus } from '@dloizides/ui-feedback';
export const toastBus = createToastBus();
```

```tsx
// once, in the shell:
<ToastHost subscribe={toastBus.subscribe} />

// anywhere — no provider needed:
useMutation({ onSuccess: () => toastBus.success(FM('menu.saved')) });
toastBus.error(FM('menu.saveFailed'));
toastBus.emit(FM('menu.queued'), 'info');   // explicit type; defaults to 'info'
```

Emitting with no host mounted is a silent no-op. Every subscriber receives every emit, and
`subscribe` returns an unsubscribe.

## Error boundary — `<AppErrorBoundary>`

Wrap your app once. The fallback renders through `ErrorState`, so it themes from the provider,
and it announces itself (`role="alert"` + `accessibilityLiveRegion="assertive"`).

```tsx
<AppErrorBoundary
  labels={{ title: FM('errorBoundary.title'), message: FM('errorBoundary.message') }}
  showDetails={__DEV__}
  onError={(error, info) => captureException(error, { extra: { componentStack: info.componentStack } })}
  recover={(error) => isChunkLoadError(error) && attemptChunkRecovery()}
  onReload={reloadPage}
>
  <App />
</AppErrorBoundary>
```

| Prop | Purpose |
|------|---------|
| `onError(error, info)` | Reporting sink (Sentry / logger). Called for **every** caught error, before `recover`. |
| `recover(error)` | Return `true` if handled (e.g. a guarded reload is under way) → shows the `updating` screen instead of the error screen. |
| `showDetails` | Render the error message in the fallback (dev-only). Default `false`. |
| `labels` | Partial, **pre-localized** `ErrorBoundaryLabels`; anything omitted uses the English defaults in `DEFAULT_ERROR_BOUNDARY_LABELS`. |
| `testIDPrefix` | Prefix for every testID. Default `error-boundary`. |
| `fallback(state)` | Escape hatch — replaces the built-in fallback entirely. Receives `{ error, recovering, retry }`. |
| `onReload` | Optional secondary **Reload** action. The kit never touches `window`, so you inject the reload. |

The package imports no i18n runtime — localize at the call site and pass strings.

## i18n keys

The components call the injected `t(key)` with these keys (provide them in each app's
locale files): `common.retry`, `common.retryHint`, `common.confirm`, `common.cancel`,
`common.confirmHint`, `common.cancelHint`, `loadingFallback.label`, `loadingFallback.hint`,
`pageSkeleton.loadingLabel`, `pageSkeleton.loadingHint`. `EmptyListState` takes its keys as props.

## testIDs

Default testIDs (`FEEDBACK_TEST_IDS`) match the strings the consuming apps already used,
so existing Playwright selectors keep working: `error-state`, `error-state-retry`,
`empty-list-cta`, `loading-fallback`, `page-skeleton`, `confirm-dialog`, `confirm-button`,
`cancel-confirm-button`, `notification-toast`, `warming-overlay`, `error-boundary`.

`AppErrorBoundary` derives its ids from `testIDPrefix` (default `error-boundary`), preserving the
selectors the app-local copies used: `error-boundary`, `error-boundary-message`,
`error-boundary-details`, `error-boundary-retry-button`, `error-boundary-reload-button`,
`error-boundary-updating`.

## License

MIT
