import { tileMotionStyle } from './tileMotion';

import type { FeedbackTheme } from '../context/FeedbackUiContext';

const theme: FeedbackTheme = {
  colors: { background: '#fff', surface: '#f7f7f7', surfaceElevated: '#fff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#005f73' } },
  semantic: { error: { '500': '#ae2012' } },
};

const idle = { hovered: false, pressed: false, focused: false };

describe('tileMotionStyle', () => {
  it('with a hovered interactive tile, lifts it and tones its border', () => {
    const input = { interaction: { ...idle, hovered: true }, reduced: false, interactive: true };

    const style = tileMotionStyle(theme, input);

    expect(style).toMatchObject({ transform: [{ translateY: -2 }], borderColor: '#666', transitionDuration: '160ms' });
  });

  it('with reduced motion, keeps the border tone without lift or transition', () => {
    const input = { interaction: { ...idle, hovered: true }, reduced: true, interactive: true };

    const style = tileMotionStyle(theme, input);

    expect({ transform: style.transform, transition: style.transitionDuration, border: style.borderColor }).toEqual({ transform: undefined, transition: undefined, border: '#666' });
  });

  it('with a pressed tile, settles it without lift and with a smaller shadow', () => {
    const input = { interaction: { ...idle, hovered: true, pressed: true }, reduced: false, interactive: true };

    const style = tileMotionStyle(theme, input);

    expect({ transform: style.transform, radius: style.shadowRadius }).toEqual({ transform: undefined, radius: 4 });
  });

  it('with a focused tile, draws the primary focus ring', () => {
    const input = { interaction: { ...idle, focused: true }, reduced: false, interactive: true };

    const style = tileMotionStyle(theme, input);

    expect(style).toMatchObject({ outlineColor: '#005f73', outlineWidth: 2 });
  });

  it('with an accent colour, keeps the accent border on hover', () => {
    const input = { interaction: { ...idle, hovered: true }, reduced: false, interactive: true, accentColor: '#ae2012' };

    const style = tileMotionStyle(theme, input);

    expect(style.borderColor).toBeUndefined();
  });

  it('with a tile that cannot be pressed, returns no motion', () => {
    const input = { interaction: { ...idle, hovered: true }, reduced: false, interactive: false };

    const style = tileMotionStyle(theme, input);

    expect(style).toEqual({});
  });
});
