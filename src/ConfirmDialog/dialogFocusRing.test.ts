import { focusRingOutline } from '@dloizides/design-tokens';

import { buildDialogRingStyle } from './dialogFocusRing';

const RING_COLOR = '#2563eb';

describe('buildDialogRingStyle', () => {
  it('with keyboard focus on web, returns the design-tokens focus ring', () => {
    const visible = true;

    const style = buildDialogRingStyle(visible, RING_COLOR, true);

    expect(style).toEqual(focusRingOutline(RING_COLOR));
  });

  it('with mouse focus on web, returns no outline', () => {
    const visible = false;

    const style = buildDialogRingStyle(visible, RING_COLOR, true);

    expect(style).toEqual({ outlineWidth: 0 });
  });

  it('on native, returns no style', () => {
    const visible = true;

    const style = buildDialogRingStyle(visible, RING_COLOR, false);

    expect(style).toEqual({});
  });
});
