import type { FeedbackTheme } from '../context/FeedbackUiContext';
import type { RunStepState } from './runGroups';
import { runToneColor, runToneTextColor } from './runTone';

const baseTheme: FeedbackTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#111111',
    textSecondary: '#666666',
    border: '#dddddd',
  },
  palette: { primary: { '500': '#005f73' } },
  semantic: { error: { '500': '#ae2012' }, warning: { '500': '#d97706' }, success: { '500': '#16a34a' } },
};

const semanticText = { success: '#7fe0a0', warning: '#ffd27a', error: '#ff8a7a', info: '#8ac7ff' };
const inkTheme: FeedbackTheme = { ...baseTheme, semanticText };

describe('runToneTextColor', () => {
  it.each<[RunStepState, string]>([
    ['failed', semanticText.error],
    ['running', semanticText.warning],
    ['done', semanticText.success],
  ])('with semanticText and state %s, returns the semantic text colour', (state, expected) => {
    const color = runToneTextColor(inkTheme, state);

    expect(color).toBe(expected);
  });

  it('with semanticText and a pending state, returns the secondary text colour', () => {
    const color = runToneTextColor(inkTheme, 'pending');

    expect(color).toBe(baseTheme.colors.textSecondary);
  });

  it.each<RunStepState>(['failed', 'running', 'done', 'pending'])(
    'with no semanticText and state %s, returns the same colour as the fill tone',
    (state) => {
      const color = runToneTextColor(baseTheme, state);

      expect(color).toBe(runToneColor(baseTheme, state));
    },
  );
});
