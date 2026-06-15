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

## i18n keys

The components call the injected `t(key)` with these keys (provide them in each app's
locale files): `common.retry`, `common.retryHint`, `common.confirm`, `common.cancel`,
`common.confirmHint`, `common.cancelHint`, `loadingFallback.label`, `loadingFallback.hint`,
`pageSkeleton.loadingLabel`, `pageSkeleton.loadingHint`. `EmptyListState` takes its keys as props.

## testIDs

Default testIDs (`FEEDBACK_TEST_IDS`) match the strings the consuming apps already used,
so existing Playwright selectors keep working: `error-state`, `error-state-retry`,
`empty-list-cta`, `loading-fallback`, `page-skeleton`, `confirm-dialog`, `confirm-button`,
`cancel-confirm-button`.

## License

MIT
