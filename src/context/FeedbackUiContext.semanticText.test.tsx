import React from 'react';

import { renderHook } from '@testing-library/react';

import { UiProvider, useUi, type UiTheme } from '../index';

const baseTheme: UiTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#111111',
    textSecondary: '#666666',
    border: '#dddddd',
  },
  palette: { primary: { '500': '#005f73' } },
  semantic: { error: { '500': '#ae2012' } },
};

function themeFromProvider(theme: UiTheme): UiTheme {
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <UiProvider t={(key) => key} theme={theme}>
      {children}
    </UiProvider>
  );
  return renderHook(() => useUi(), { wrapper }).result.current.theme;
}

describe('useUi semanticText', () => {
  it('with semanticText on the provider theme, returns it unchanged', () => {
    const semanticText = { success: '#7fe0a0', warning: '#ffd27a', error: '#ff8a7a', info: '#8ac7ff' };

    const theme = themeFromProvider({ ...baseTheme, semanticText });

    expect(theme.semanticText).toEqual(semanticText);
  });

  it('with no semanticText on the provider theme, returns none', () => {
    const theme = themeFromProvider(baseTheme);

    expect(theme.semanticText).toBeUndefined();
  });
});
