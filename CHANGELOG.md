# Changelog

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
