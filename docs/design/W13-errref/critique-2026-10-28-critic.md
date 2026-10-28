# W13-errref "Error reference placement" — design-critic sheet (2026-10-28)

Task: OBS-1 "Every app ships metrics, production-grade logs and alerts with working links", job W13-errref.
Page: https://claude.ai/artifact/JG2fCLenm98tcyHN87hLa2 (source `index.html` beside this file).
Judged from the 24 PNGs in `img/` (360x640 at DPR 3 = 1080x1920, 1280x800 at DPR 1) and `result.json`. Blind to the
designer's round-1 sheet scores; that sheet was written by the designer itself, so this is the first independent round.

## Hard fails (checked first)

| Check | A | B | C |
|---|---|---|---|
| 1 Lost item (6 rows: page icon/title/message/Retry/Back, toast message) | none, 6/6 visible in every after frame | none, 6/6 | none, 6/6 |
| 2 Misaligned row | Retry + Back at 1280: both 524-571 px, 0 px off. Ref row label/id/Copy glyph tops 1188-1190 dev px at 360 (under 1 css px) | same frames as A (page afters byte-identical) | no new row; existing Retry + Back 0 px off |
| 3 Pair parity | 12 records, all six pair keys equal per shot; befores byte-identical across A/B/C | same | same |

No hard fail. No `WITHDRAW`.

**Evidence defect in A (not a hard fail, but A cannot be picked on it):** `after/A-toast-1280x800.png` differs from its
before only inside the toast (diff bbox 384,89-896,143). The ErrorState card behind it still has message-to-Retry spacing
of 22 px, i.e. **no error reference line**, while `after/A-page-1280x800.png` shows the line in that same card. Cause:
`capture.cjs:110` injects only the toast on toast shots. The frame shows a half-A build, so the owner sees a screen that
A would never produce. Recapture A toast shots with `injectPage` + `injectToast`.

## Scores

| # | Criterion | A every message | B full-page only | C hidden |
|---|---|---|---|---|
| 1 | Focal / purpose | 4: title stays focal; ref reads as secondary | 4: same page render as A | 4: unchanged |
| 2 | Portability | 3: stock "Error reference + Copy" pattern | 3: same | 3: stock error state, untouched |
| 3 | Hierarchy, type, spacing | 3: two type treatments for one thing (page: sans label + mono id; toast: whole line mono incl. label); ref sits between message and the primary action and pushes Retry down 48 css px at 360 | 4: one treatment; same wedge above Retry | 4: unchanged |
| 4 | Visual language | 4: no new colour; ref text 5.98:1 on card, 5.35:1 on toast red | 4: 5.98:1 | 4 |
| 5 | Taste ledger | 4: no `taste-ledger.md` exists for ui-feedback; judged against memory `user_design_taste.md` ("calm"); a toast growing a mono line is the least calm | 4 | 4: calmest |
| 6 | No AI-default tells | 5 | 5 | 5 |
| 7 | 360 + 1280, text fits | 3: fits both, but the 1280 toast frame does not render A (above); Copy hit box not measurable from pixels (glyph ~13 css px tall) | 4: fits both; Copy hit box unmeasured | 4: unchanged, fits |
| 8 | Inventory k/n true on the picture | 5: 6/6 | 5: 6/6 | 5: 6/6 |
| | **Mean / lowest** | **3.9 / #2,#3,#7=3** | **4.1 / #2=3** | **4.1 / #2=3** |
| | **Verdict** | **REDO** (mean < 4; recapture) | **PASS** | **PASS** |

Rank (independent scores): B = C > A. B and C tie on pixels; the difference between them (user can quote an id vs
support searches Grafana by time and account) is a product call the owner makes, not a pixel call.

## Top fixes

**A**
1. Recapture both A toast frames with the page injection too (`capture.cjs:110`), so the after is the whole A build.
2. One type treatment: in the toast, "Error reference" in the body sans at the secondary size, only `4bf92f35` in mono, as on the page.
3. Move the reference row below the Retry / Back row (footnote position, 12-16 px gap), so nothing sits between the message and the primary action.

**B**
1. Move the reference row below the Retry / Back row, same as A fix 3.
2. Give Copy a 44x44 hit box (padding, not a larger glyph) and show "Copied" for 1.5 s in place of the label.

**C**
1. None on pixels. (No inventory item is touched by any fix above.)

## rowsMethod (OPTION-GATE-1 requirement 9)

Applies; the check is not a false positive. Requirement 9 exists to forbid exactly what `result.json` does: a hand
assertion (`alignedNote: "no side-by-side form row on these screens"`) in place of rows discovered on every frame. These
frames do contain side-by-side controls: Retry + Back at 1280 and, in A/B, the label / id / Copy row. Measured here
they pass (0 px and under 1 css px), so `data-aligned="pass"` is true on the pixels; the JSON is wrong only on method.
Fix: run `discoverRows` (kefi-web `docs/visual-review/lib/visible-in-frame.cjs`) in `capture.cjs` on every frame, record
the rows found per frame, and declare `"rowsMethod": "auto"`.

## Pre-existing, outside the options

Retry renders the raw key `common.retry` in every before and after (ui-showcase translation gap); it predates this job.

NOT COVERED: dark mode not captured; Copy hit box and "Copied" feedback not measured (pixels only); toast motion and
dwell time not judged from stills; real device not used; 1280 desktop-wide layouts above 1280 not seen; long trace ids
or long localized labels (TEXT-FIT-1 in other locales) not rendered.

---

## Round 2 (2026-10-28, ui-feedback 5aa8664, artifact v2)

C is unchanged: its images are byte-identical to round 1, so the round-1 C row stands (PASS, 4.1).

**Hard fails:** none. A and B are 6/6 in every after frame. `rowsMethod: "auto"` is declared, and each 1280 frame
records 2 discovered rows (Retry + Back, and the ToastHost pair), both 0 px off. The 360 frames record no rows because
those buttons stack. Pair keys are equal on all 24 frames.

**Round-1 fixes, checked on the pixels:**
- A toast-1280 after now carries both changes: the page card shows the reference row and the toast shows its second line. Fixed.
- The page reference row now sits below Retry / Back at 360 and 1280. Nothing sits between the message and the primary action any more. Fixed.
- Toast label: "Error reference" is in the body sans and only `4bf92f35` is mono, the same as on the page. Fixed.
- Copy hit box ≥ 56x44: this is the designer's claim. The glyph is unchanged and the box cannot be measured from pixels. Not verified.

**New finding (record, not design; not a hard fail):** in the toast shots with the page change, the content above the
ToastHost anchor grows by 56 px. The trigger lands at 462 px in the after frame and at 406 px in the before frame. That
matches `rows` in the same `result.json`, but `landed.anchorTop` still says 406 for both. `landed` is measured before the
mock is injected, so it is false for the after frame. Both frames show the same screen in the same state, and the 56 px
shift is the option's own added row. Fix: measure `landed` after `injectPage` / `injectToast`.

| # | A r2 | B r2 |
|---|---|---|
| 1 | 4 | 4 |
| 2 | 3 | 3 |
| 3 | 4: one type treatment; reference row is a footnote below the actions | 4 |
| 4 | 4 | 4 |
| 5 | 4 | 4 |
| 6 | 5 | 5 |
| 7 | 4: both viewports fit and render A | 4 |
| 8 | 5: 6/6 | 5: 6/6 |
| **Mean / lowest** | **4.1 / #2=3, PASS** | **4.1 / #2=3, PASS** |

The three options tie at 4.1. Choosing among A, B and C is a product decision for the owner (how far the reference shows).

NOT COVERED (round 2): the Copy hit box and "Copied" feedback, dark mode, toast motion, a real device, and other locales.
