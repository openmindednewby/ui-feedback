# Design critique: @dloizides/ui-feedback ConfirmDialog, 44 px actions (round 1, 2026-10-25)

Tier: style-only (DESIGN-TIER-1 "Two-tier design process"). Judged from pixels in `dialog-44/`:
`before-*` (live ui.dloizides.com/payments), `harness-before-*` and `harness-after-*` (local harness from
package source), each at 360x640 and 1280x800, plus the three `*-measure.json` files.

Change judged: action buttons 41 -> 44 px tall; dialog named by `aria-labelledby`; nested `role=dialog`
removed on web. Focus-outline styling is out of scope (separate focus-ring task).

## Verdict: PASS (mean 4.1, lowest #2 = 3)

## What changed in the pixels

- Buttons: 144x41 / 110x41 -> 144x44 / 110x44 at both viewports (measure.json). In the captures the
  button row grows by 3 px and the card by about 3 px (mobile card top 696 -> 690 at 3x DPR, centred).
  No reflow, no wrap, no clipping at either viewport. Label baselines unchanged.
- Accessibility tree: two dialogs (one unnamed modal, one named non-modal) -> one modal dialog named
  "Disconnect Stripe?" by `labelledby`. Not visible in pixels; read from measure.json only.
- Initial focus stays on `cancel-confirm-button` (FOCUS-1 "Every screen names its initial focus": the safe
  action, not the destructive one). Escape still closes. Tab walk unchanged.

## Score sheet

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | Title "Disconnect Stripe?" reads first, red Disconnect second; purpose clear in under a second at both sizes. |
| 2 | Portability | 3 | Stock confirm card; only the copy ("stored keys are deleted") is product-specific. Unchanged by this fix. |
| 3 | Hierarchy, type, spacing, colour | 4 | Title / body / actions hierarchy intact; 44 px gives the labels slightly more air; body grey contrast holds. |
| 4 | Visual language | 4 | Same tokens as before; no new colour, radius or shadow introduced. `vf_measure.py` not run (style-only). |
| 5 | Taste ledger | 4 | No `docs/design/taste-ledger.md` exists for ui-feedback or ui-showcase; nothing contradicts "calm" from `user_design_taste.md`. |
| 6 | No AI-default tells | 5 | No gradient, violet, glass or emoji. |
| 7 | 360x640 + 1280x800, text fits | 4 | Both rendered; every label fits its box. Mobile buttons are content-width, not full-width (pre-existing). |
| 8 | Inventory | 5 | Style-only, nothing moved: title, message, Keep connected, Disconnect = 4/4 visible in after captures. |
| 9 | Games only | n/a | |

Mean of 1-8 = 33 / 8 = 4.1. Every criterion >= 3. Bar met.

## Top fixes (not blocking; for later tasks, not this commit)

1. At 360 px make the two actions fill the row (each `flex: 1`) so the 44 px targets are also wide and
   the row stops floating right of the card's text column (the left button starts ~14 px in from the body text).
2. Hand to the focus-ring task: in every capture the destructive Disconnect button carries a heavy ring
   (amber at 360, near-black at 1280) while measure.json reports focus on Keep connected. If that ring is a
   resting style it reads as "Disconnect is focused"; if it is focus, the measurement and the picture disagree.
3. Harness red (#DC2626-ish) is brighter than live (#B91C1C-ish): the harness has no app theme, so
   harness captures prove geometry, not colour. Capture the showcase after publish to close that.

## NOT COVERED

- After-state on the live showcase: only the harness shows 44 px; live is before-only until publish.
- Dark mode, native (iOS/Android) rendering, loading and disabled states, long title/message wrapping.
- Screen-reader announcement heard on a real AT; only the DOM attributes were read.
- Motion (fade) not judged from stills; focus ring excluded by brief.
