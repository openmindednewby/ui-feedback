# Changelog

## 1.6.0

Two fleet-wide duplicates extracted (W1.2 + W1.3). Both are purely additive — every
existing export is unchanged.

- **Add `createToastBus()` — the shared toast EMIT half (W1.2).** Promoted from the three
  hand-rolled ~25-line twins in `aml-v2` (`components/toast.ts` — `emitToast`/`subscribeToasts`),
  `agora-web` and `zygos-web` (`lib/toastBus.ts` — `toastSuccess`/`toastError`). The returned
  bus is a superset: `subscribe` (the `<ToastHost>` port), `emit(text, type?)`, and the
  `success`/`error`/`info` shorthands.

  **Deliberately framework-agnostic — no React import, no hook, no provider.** Call sites are
  React Query mutation `onSuccess`/`onError` callbacks with no component context in scope, so a
  hook-based API would break every one of them. It carries no styling: `<ToastHost>` themes each
  toast from `UiProvider`. Text passed in is already localized by the caller.

  New exports: `createToastBus`, `ToastBus`, `ToastPush`.

- **Add `<AppErrorBoundary>` — the shared top-level error boundary (W1.3).** Promoted from the
  SIX app-local copies (`agora-web` + `zygos-web` byte-identical, `kefi-web`, `erevna-web`,
  `katalogos-web`, `ichnos-web`); `aml-v2` had none at all. The axes that actually varied are now
  injected rather than baked in: `onError` (Sentry/logger), `recover` (the apps' chunk-load
  retry), `showDetails` (dev-only error text), `labels` (pre-localized bag), `testIDPrefix`,
  and `fallback` (escape hatch). An optional `onReload` renders the manual **Reload** action
  that kefi/erevna/katalogos shipped alongside **Try Again**.

  Two behaviour fixes come with the extraction:
  - **Themed.** The fallback renders through the shared `<ErrorState>`, so it reads
    `UiProvider` colours — this removes the 40+ hardcoded Bootstrap-4 hex literals
    (`#f8f9fa`, `#212529`, `#6c757d`, `#fff3cd`, `#856404`, `#007bff`, …) three copies carried.
  - **Announced.** The fallback ships `role="alert"` + `accessibilityLiveRegion="assertive"`;
    none of the six announced anything to a screen reader, and agora/zygos rendered only the
    app *name* with no message and no retry.

  New exports: `AppErrorBoundary`, `AppErrorBoundaryProps`, `ErrorFallbackState`,
  `ErrorBoundaryLabels`, `DEFAULT_ERROR_BOUNDARY_LABELS`, plus the `errorBoundary` id in
  `FEEDBACK_TEST_IDS` (default prefix `error-boundary`, preserving the existing
  `error-boundary-retry-button` / `-reload-button` / `-updating` Playwright selectors).

## 1.5.0

- **Accessibility (WCAG 2.1 AA) — `ToastHost` announcements.** Each toast is now a live region so
  a screen reader announces it (WCAG 4.1.3): success/info toasts render as `role="status"` with
  `aria-live="polite"`, error toasts escalate to `role="alert"` with `aria-live="assertive"`
  (`accessibilityLiveRegion` set for native parity). Rendering, timing and testIDs are unchanged —
  additive + backward-compatible.

## 1.3.0

- Add `ToastHost` — the shared, tokenized transient-toast overlay promoted from the
  byte-identical erevna-web / katalogos-web `ToastContainer` twins. Rendering (animated
  fade, positioning, theming) lives here; the emit pipeline stays in the app and is wired
  in via the `subscribe` port (`(push) => unsubscribe`). Colours come from the UiProvider
  theme. New exports: `ToastHost`, `ToastHostProps`, `ToastInput`, `ToastType`, plus the
  `notificationToast` id in `FEEDBACK_TEST_IDS` (default toast testID `notification-toast`,
  preserving existing Playwright selectors).

## 1.2.0

- Broaden the injected theme so the settings-hub kit can consume it: colour scales are now
  addressable at any step (`[step]`), and `palette`/`semantic` accept named scales beyond
  `primary`/`error` (e.g. `secondary`, `accent`, `success`, `warning`, `info`) via index signatures.
  Purely additive — existing `{primary}`/`{error}` themes still satisfy the types. Default value now
  includes the common extra scales so no-provider rendering never reads `undefined`.

## 1.1.0

- Add `colors.surface` to the injected theme (needed by the ui-forms kit; apps already pass it).
- Export neutral aliases `UiProvider` / `useUi` (+ `Ui*` types) for the feedback-specific
  `FeedbackUiProvider` / `useFeedbackUi`. ui-feedback is now the shared UI context for the kit;
  sibling packages (ui-forms, ui-tables, …) consume `useUi` instead of duplicating the provider.

## 1.0.2

- `useFeedbackUi` now falls back to a neutral default theme + identity translate when no
  `FeedbackUiProvider` is mounted (graceful degradation), instead of throwing. Apps still
  mount a provider for the real theme/i18n; isolated tests render without one.

## 1.0.0

Initial release. Extracted the proven duplicated feedback components from erevna-web ↔
katalogos-web (Capability Wave C1, batch 1).

- `FeedbackUiProvider` + `useFeedbackUi` — injectable theme/translate/navigate context.
- `ErrorState`, `EmptyListState`, `LoadingFallback`, `PageSkeleton`, `ConfirmDialog`.
- `FEEDBACK_TEST_IDS`, `MODAL_OVERLAY_COLOR`, `DISABLED_OPACITY` constants.
