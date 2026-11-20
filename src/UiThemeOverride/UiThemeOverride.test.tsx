import { render, screen } from '@testing-library/react';
import React from 'react';

import { FeedbackUiProvider, useFeedbackUi } from '../context/FeedbackUiContext';
import type { FeedbackTheme, FeedbackUiValue } from '../context/FeedbackUiContext';
import { UiThemeOverride } from './UiThemeOverride';

const BASE: FeedbackTheme = {
  colors: { background: '#fff', surface: '#eee', surfaceElevated: '#fff', text: '#111', textSecondary: '#555', border: '#ccc' },
  palette: { primary: { '500': '#2a5' } },
  semantic: { error: { '500': '#c00' } },
};
const BAND_SURFACE = '#1f3a5f';
const toBand = (theme: FeedbackTheme): FeedbackTheme => ({ ...theme, colors: { ...theme.colors, surface: BAND_SURFACE } });

const seen: FeedbackUiValue[] = [];
const Probe = (): React.ReactElement => {
  seen.push(useFeedbackUi());
  return <span data-testid="probe" />;
};

describe('UiThemeOverride', () => {
  beforeEach(() => {
    seen.length = 0;
  });

  it('with a map, gives children the mapped theme', () => {
    const t = (key: string): string => key;

    render(
      <FeedbackUiProvider t={t} theme={BASE}>
        <UiThemeOverride map={toBand}>
          <Probe />
        </UiThemeOverride>
      </FeedbackUiProvider>,
    );

    expect(seen[seen.length - 1]?.theme.colors.surface).toBe(BAND_SURFACE);
  });

  it('with an outer translate and navigate, keeps both for the children', () => {
    const t = (key: string): string => `x.${key}`;
    const navigate = jest.fn();

    render(
      <FeedbackUiProvider navigate={navigate} t={t} theme={BASE}>
        <UiThemeOverride map={toBand}>
          <Probe />
        </UiThemeOverride>
      </FeedbackUiProvider>,
    );

    const inner = seen[seen.length - 1];
    expect([inner?.t, inner?.navigate, screen.getByTestId('probe') !== null]).toEqual([t, navigate, true]);
  });

  it('with the outer theme object, passes that same object to the map', () => {
    const map = jest.fn(toBand);

    render(
      <FeedbackUiProvider t={(key) => key} theme={BASE}>
        <UiThemeOverride map={map}>
          <Probe />
        </UiThemeOverride>
      </FeedbackUiProvider>,
    );

    expect(map).toHaveBeenCalledWith(BASE);
  });
});
