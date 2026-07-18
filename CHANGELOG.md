# Changelog

## 1.7.0

Closes the API gap that kept `kefi-web`, `erevna-web` and `katalogos-web` on their
local `ErrorBoundary` copies. Those three vary the boundary **by error class** — a
stale-chunk failure after a deploy needs different wording, no retry button, and no
stack dump — which 1.6.0's static `labels` / boolean `showDetails` could not express.
Every addition is opt-in; the pre-1.7.0 test suite passes unmodified.

**The kit still does not know what a "chunk" is.** Apps inject the classification;
the boundary only learns *whether retry is meaningful* and *what to say*.

- **Add `retryable?: (error) => boolean`.** When it returns `false` the retry action is
  not rendered at all. Offering a button that re-renders straight back into the same
  missing chunk is worse than offering nothing. Default: every error is retryable
  (1.6.0 behaviour).
- **Add `labelsFor?: (error) => Partial<ErrorBoundaryLabels>`,** merged OVER the static
  `labels`. Lets an app say "Update available" for a stale chunk without the kit knowing
  why — it sees only the resulting strings.
- **Widen `showDetails` to `boolean | ((error) => boolean)`.** A predicate can suppress
  the dev-only block per error class (a hashed filename is noise, not signal). **A plain
  boolean behaves exactly as before.**
- **Add `onMount?: () => void`,** called from `componentDidMount` ONLY when the mount was
  clean. The three apps release their one-shot reload guard here: a clean mount proves the
  current chunks loaded, so a FUTURE deploy may auto-recover again. Deliberately not called
  on an errored mount — that would re-arm the guard during the very failure it bounds.
- **Add `reloadIsPrimary?: boolean`** (default `false`). Gives Reload the filled emphasis
  and the first position instead of Try Again.

  **Why a flag rather than an unconditional swap:** `agora-web` and `zygos-web` both pass
  `onReload`, so simply inverting the priority would have silently restyled and reordered
  their error screens too. They have no chunk-recovery path, so retry is still the right
  primary there. The default preserves their rendering exactly; the three chunk-aware apps
  opt in.

**Notably, `DEFAULT_ERROR_BOUNDARY_LABELS` gains no `updateTitle`/`updateMessage`.** Those
are domain vocabulary — "an update is available" is a fact about the app's deploy model, not
about error boundaries. `labelsFor` supplies them as ordinary `title`/`message` overrides,
which keeps the kit's label bag domain-free.

### Fixed

- **`AppErrorBoundary.test.tsx` had never actually run.** `jest.setup.ts` imports
  `@testing-library/jest-dom`, which registers matchers at runtime, but `tsconfig.test.json`
  listed no `types`, so ts-jest failed every `toBeInTheDocument()` with TS2339 and aborted the
  whole suite at compile time. It was the only suite using those matchers, so `npm test`
  reported a red SUITE while the other five stayed green and the true test count read 34.
  Adding `"types": ["jest", "node", "@testing-library/jest-dom"]` brings its 14 assertions
  online for the first time — unmodified, and passing against the 1.7.0 source.

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
