import { contrastRatio } from '@dloizides/design-tokens';

import { confirmFill, confirmInk } from './confirmDialogColors';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

const themeOf = (surfaceElevated: string, primary: string, error: string): FeedbackTheme =>
  ({ colors: { surfaceElevated }, palette: { primary: { '500': primary } }, semantic: { error: { '500': error } } }) as unknown as FeedbackTheme;

const DARK = themeOf('#242833', '#5b8def', '#ae2012');
const LIGHT = themeOf('#ffffff', '#2563eb', '#dc2626');

describe.each([
  ['dark', DARK],
  ['light', LIGHT],
])('confirm button colours (%s theme)', (_name, theme) => {
  it.each([true, false])('label ink clears 4.5:1 on the fill (destructive=%s)', (destructive) => {
    const fill = confirmFill(theme, destructive);
    expect(contrastRatio(confirmInk(theme, destructive), fill)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('confirmFill', () => {
  it('fills a destructive confirm with error 500 and a plain confirm with primary 500', () => {
    expect(confirmFill(DARK, true)).toBe('#ae2012');
    expect(confirmFill(DARK, false)).toBe('#5b8def');
  });
});

describe('confirmInk', () => {
  it('never paints the label with the dialog surface colour', () => {
    expect(confirmInk(DARK, true)).not.toBe('#242833');
  });
});
