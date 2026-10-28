# W13-errref build review: @dloizides/ui-feedback 1.19.0 "Error reference" row (2026-10-28)

Task: OBS-1 "Every app ships metrics, production-grade logs and alerts with working links", decision D-OBS-23
"Error reference placement" option A, build check D-OBS-24. Judged from the 16 PNGs in `before/` (1.18.0) and
`after/` (1.19.0) beside this file plus `data-result.json`. 360x640 frames are DPR 2 (720x1280); 1280x800 are DPR 1.
Spec: `../../design/W13-errref/critique-2026-10-28-critic.md` (A top fixes) and `../../design/taste-ledger.md` row
2026-10-28 (A picked).

## Hard fails (checked first)

| Check | Result |
|---|---|
| 1 Lost item | None. Every item in each before frame is in its after frame: both ErrorState cards (title, message, Retry, Back to library, footnote) and the toast (icon, "Could not save your changes"). Measured **6/6** on the items the fixtures render. Toast action and toast dismiss, named in the brief's inventory, are rendered in neither build (no fixture passes them), so they are unproven, not lost: see top fix 1. |
| 2 Misaligned row | Retry + Back at 1280: same top/bottom by eye (round-2 critic measured 0 px). Reference row glyph tops, page 1280: label 284, id 284, Copy 285. Toast 1280: 128 / 128 / 129. Toast 360: 257 / 256 / 258 dev px (under 1 css px). Pass. |
| 3 Pair parity | 8 pairs, all six `pair` keys equal, `landed.anchorTop` equal per pair, `pairMethod: same-steps` on two real builds. Pixel diff per pair is confined to the change (ref row and the toast's second line) except a 1-dev-px hairline (0.5 css) at y 1161 (state-plain 360) and y 883 (toast-plain 360): sub-pixel anchor rounding, same screen and state. Pass. |

No hard fail. No `WITHDRAW`.

## Option A + its top fixes, on the pixels

| Spec item | Build 1.19.0 |
|---|---|
| Row below Retry / Back (page) | Yes, 360 and 1280. Nothing between message and Retry; the message-to-Retry gap is unchanged from 1.18.0. |
| Label in body sans, only the id mono (page and toast) | Yes in all four trace frames. |
| Toast carries the row when a trace id exists, nothing when not | Yes: toast-trace has a second line; toast-plain after is byte-identical to before inside the toast. |
| Full-page error without a trace id is unchanged | Yes: state-plain card identical to before. |
| Copy ≥ 56x44 | Not verifiable from pixels. Glyph is 12 css px tall; the spacing around it (25 css px from the id line at 360) is consistent with a 44 px box but does not prove it. |
| Raw `common.retry` key (round-1 pre-existing note) | Gone: "Retry" renders in every frame. |

## Scores

| # | Criterion | Score: evidence |
|---|---|---|
| 1 | Focal / purpose | 4: "Library didn't load" stays the focal point; the ref row reads as a footnote. |
| 2 | Portability | 3: stock "Error reference + Copy" pattern, as every round scored. |
| 3 | Hierarchy, type, spacing | 4: one type treatment everywhere. At 360 the page row breaks in two, Copy alone on a centred second line (label+id span 155 css px of a ~230 px column), while the narrower toast keeps all three on one line. |
| 4 | Visual language | 4: no new colour; secondary text grey on card, white on toast red. |
| 5 | Taste ledger | 4: matches the 2026-10-28 row (A, label body font, id mono, below Retry/Back). |
| 6 | No AI-default tells | 5 |
| 7 | 360 + 1280, text fits | 4: every string fits in all 8 after frames, no clipping; Copy hit box unmeasured. |
| 8 | Inventory k/n true on the picture | 5: 6/6 on rendered items. |
| | **Mean / lowest** | **4.1 / #2=3: PASS** |

## Top fixes (none removes an inventory item)

1. Add a capture pair of a toast with an action and a trace id (`toastBus.error(text, { traceId, action })`) and the
   dismiss control shown, at 360 and 1280: Copy now occupies the toast's trailing edge, which is where an action or
   dismiss sits, and no frame proves they coexist. File: the capture script that writes this folder
   (`ui-showcase` `/feedback` fixtures + its capture spec).
2. Keep Copy on the id line in the page ErrorState at 360, as the toast already does (row is ~210 css px; the column has
   ~230). File: `packages/ui-feedback` ErrorState reference row style (drop the wrap / min-width that forces the break).
3. Measure Copy's box in a live render (`getBoundingClientRect` ≥ 56x44, page and toast) and record it in
   `data-result.json`, so the ledger's "≥ 56x44" is evidence, not a claim.

## Record defects (not design)

- `observed.referenceRows` counts DOM rows, not rows in the frame: state-plain 360 after and toast-plain 360 after say
  1, but no reference row is visible in either frame (it is above the crop). Count only rows inside the viewport.
- `data-result.json` has no `options["W13-errref"].inventory`; measured value for it: `6/6`.
- The brief's inventory lists 8 items (toast title, message, action, dismiss; page title, message, Retry, Back) but
  counts 6/6. The task doc's `## Information inventory` should name the same rows it counts.

NOT COVERED: Copy hit box and the "Copied" feedback (pixels only, no live DOM); toast action and dismiss next to Copy
(no fixture renders them); dark mode; toast motion and dwell; keyboard focus order on Copy (FOCUS-1, NAV-1); long trace
ids and other locales (TEXT-FIT-1 beyond English); widths above 1280; a real device.
