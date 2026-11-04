import { contrastRatio } from '@dloizides/design-tokens';

import type { FeedbackTheme } from '../context/FeedbackUiContext';
import { TOAST_TOP_WEB, resolveToastTone, toastTop } from './toastTone';

function themeWith(semantic: FeedbackTheme['semantic'], primary: FeedbackTheme['palette']['primary']): FeedbackTheme {
  return {
    colors: {
      background: '#ffffff',
      surface: '#f7f7f7',
      surfaceElevated: '#ffffff',
      text: '#111111',
      textSecondary: '#666666',
      border: '#dddddd',
    },
    palette: { primary },
    semantic,
  };
}

describe('resolveToastTone', () => {
  it('with a pale success fill, returns an ink at 4.5:1 or better on it', () => {
    const theme = themeWith({ error: { '500': '#ae2012' }, success: { '500': '#ecf1e8' } }, { '500': '#005f73' });

    const tone = resolveToastTone(theme, 'success');

    expect(tone.fill).toBe('#ecf1e8');
    expect(contrastRatio(tone.ink, tone.fill)).toBeGreaterThanOrEqual(4.5);
  });

  it('with a mid-grey main step no ink can read, uses the deep step', () => {
    const theme = themeWith({ error: { '500': '#777777', '700': '#7f1d1d' } }, { '500': '#005f73' });

    const tone = resolveToastTone(theme, 'error');

    expect(tone.fill).toBe('#7f1d1d');
    expect(contrastRatio(tone.ink, tone.fill)).toBeGreaterThanOrEqual(4.5);
  });

  it('with no readable step, returns the elevated surface with body text and the main step as border', () => {
    const theme = themeWith({ error: { '500': '#777777' } }, { '500': '#005f73' });

    const tone = resolveToastTone(theme, 'error');

    expect(tone).toEqual({ fill: '#ffffff', ink: '#111111', border: '#777777', glyph: '!' });
  });

  it('with no success scale, uses the primary scale rather than the error scale', () => {
    const theme = themeWith({ error: { '500': '#ae2012' } }, { '500': '#005f73' });

    const tone = resolveToastTone(theme, 'success');

    expect(tone.fill).toBe('#005f73');
  });

  it('for success, error, info and warning, returns four different glyphs', () => {
    const theme = themeWith({ error: { '500': '#ae2012' }, success: { '500': '#16a34a' } }, { '500': '#005f73' });

    const glyphs = new Set(['success', 'error', 'info', 'warning'].map((type) => resolveToastTone(theme, type as 'success').glyph));

    expect(glyphs.size).toBe(4);
  });

  it('for warning with a warning scale, fills from it with an ink at 4.5:1 or better', () => {
    const theme = themeWith({ error: { '500': '#ae2012' }, warning: { '500': '#d97706' } }, { '500': '#005f73' });

    const tone = resolveToastTone(theme, 'warning');

    expect(tone.fill).toBe('#d97706');
    expect(contrastRatio(tone.ink, tone.fill)).toBeGreaterThanOrEqual(4.5);
  });

  it('for warning with no warning scale, uses the info fill, ink and border, never the error scale', () => {
    const theme = themeWith({ error: { '500': '#ae2012' } }, { '500': '#005f73' });

    const tone = resolveToastTone(theme, 'warning');
    const info = resolveToastTone(theme, 'info');

    expect(tone.fill).toBe('#005f73');
    expect({ fill: tone.fill, ink: tone.ink, border: tone.border }).toEqual({ fill: info.fill, ink: info.ink, border: info.border });
  });

  it('with a warning scale present, leaves the success, error and info fills unchanged', () => {
    const theme = themeWith(
      { error: { '500': '#ae2012' }, success: { '500': '#16a34a' }, warning: { '500': '#d97706' } },
      { '500': '#005f73' },
    );

    const fills = ['success', 'error', 'info'].map((type) => resolveToastTone(theme, type as 'success').fill);

    expect(fills).toEqual(['#16a34a', '#ae2012', '#005f73']);
  });
});

describe('toastTop', () => {
  it('on web without an inset, returns 72 so a 64 px header never covers the toast', () => {
    const isWeb = true;

    const top = toastTop(isWeb);

    expect(top).toBe(72);
    expect(TOAST_TOP_WEB).toBe(72);
  });

  it('with an explicit inset, returns the inset', () => {
    const inset = 120;

    const top = toastTop(true, inset);

    expect(top).toBe(120);
  });

  it('on native without an inset, returns 40', () => {
    const isWeb = false;

    const top = toastTop(isWeb);

    expect(top).toBe(40);
  });
});
