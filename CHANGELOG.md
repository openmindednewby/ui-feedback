# Changelog

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
