# Critique: @dloizides/ui-feedback 1.18.0 toast fix (round 1, 2026-10-25)

Scope: style-only tweak (DESIGN-TIER-1 "Two-tier design process"), nothing added/removed/moved.
Answers item C of the kefi-web comp-resend REDO (toast under header at 360, low text contrast, success/error by tint only).
Evidence: before/after captures at 360x640 and 1280x800, success + error, plus `before-measure.json` / `after-measure.json`, all in this folder. Host page = ui-showcase Feedback, not kefi-web.

## Item C, point by point

| REDO point | Before | After | Status |
|---|---|---|---|
| Toast under the header at 360 | box top y=16; sits on top of the header band (header bottom ~60 css px) | box top y=78, below the header rule at both viewports | fixed |
| Text contrast | success: white on rgb(10,147,150) = 3.7:1 (fails AA 4.5 for 14-16px) | success: rgb(3,18,31) on the same teal = 5.1:1; error: white on rgb(174,32,18) = 6.9:1 | fixed |
| Success vs error by tint only | text only | circled check vs circled "!" glyph, legible in greyscale | fixed |
| Text fits (TEXT-FIT-1) | fits | fits in all 4 states (360: 177x42 / 242x42; desktop 504x42) | holds |

## Scores (1-5)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point | 4 | Toast is the only saturated block in the top third with a drop shadow; reads instantly. |
| 2 | Portability | 3 | Generic toast shape; acceptable for a shared primitive, nothing product-specific to carry. |
| 3 | Hierarchy / type / spacing | 4 | Icon + label well spaced at 360; at 1280 the 13-14px label sits in a 504px bar with ~300px empty right side. |
| 4 | Visual language | 4 | Colour-never-alone now met; text polarity flips between variants (dark on teal, white on red), justified by contrast. |
| 5 | Taste ledger | 4 | Calm, no motion noise in stills; nothing a ledger row rejects is repeated (no ledger row on toasts found in scope). |
| 6 | No AI tells | 5 | No gradient, no violet, glyphs are line icons, not emoji. |
| 7 | Mobile + desktop, text fits | 4 | Both designed; desktop bar is wider than its message needs. |
| 8 | Inventory | n/a | Style-only; message text present in every state before and after (1/1 kept). |
| 9 | Games | n/a | |

Mean 4.0, lowest #2 = 3. **PASS.**

## Top fixes (non-blocking)

1. Desktop: shrink-to-fit width (min 280, max 504) or centre the icon+label group, so the bar does not show ~300px of empty teal/red.
2. Desktop label 14px -> 15-16px to match the mobile reading size.
3. At 360 the toast covers live content (the "Back to library" button in the success capture); confirm auto-dismiss + a tap-to-dismiss target >= 44x44 so it never blocks the button under it.

## NOT COVERED

Captures are from ui-showcase, not the kefi-web screen in item C (kefi header height not re-sighted); dark mode; motion/enter-exit and auto-dismiss timing; long/2-line messages; stacked toasts; real device.

## Follow-ups (logged, not built in 1.18.0)

| # | Follow-up | Owner | Status |
|---|---|---|---|
| F1 | Desktop toast shrink-to-fit width (min 280, max 504) or centred icon+label group (critic fix 1) | frontend-dev, ui-feedback | open |
| F2 | Desktop label 14px -> 15-16px to match mobile reading size (critic fix 2) | frontend-dev, ui-feedback | open |
| F3 | At 360 confirm auto-dismiss + a >= 44x44 tap-to-dismiss target so the toast never blocks the control under it (critic fix 3) | frontend-dev, ui-feedback | open |

## Addendum: checked against the original item C (critique-comp-resend.md, round 3, lines 190-204)

- Fix 2 there asked for top >= 72 px below a 64 px kefi header: 1.18.0 gives top 78. Met on paper; not re-sighted on kefi.
- The 1.1:1 there was measured in kefi-web on a PALE tint (rgb(236,241,232) success, rgb(247,236,231) error), not on the solid teal/red seen here. These captures prove the package default; they do not prove kefi's theme now resolves to a solid surface or dark ink. Item C closes only on a kefi-web re-capture.
- Item C also had a 2-line 403 message that spilled below the header rule at 360; no 2-line message was captured here.

This is a PASS for the package. Item C itself stays open until kefi-web shows the success and 403 toasts at 360x640 and 1280x800 on 1.18.0.
