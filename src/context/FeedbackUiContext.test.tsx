import React from 'react';

import { render, screen } from '@testing-library/react';

import { FeedbackUiProvider, useFeedbackUi, type FeedbackTheme } from './FeedbackUiContext';

const theme: FeedbackTheme = {
  colors: {
    background: '#fff',
    surface: '#f7f7f7',
    surfaceElevated: '#f5f5f5',
    text: '#111',
    textSecondary: '#666',
    border: '#ddd',
  },
  palette: { primary: { '500': '#3366ff' } },
  semantic: { error: { '500': '#ff0000' } },
};

const Consumer = (): React.ReactElement => {
  const { theme: t, t: translate, navigate } = useFeedbackUi();
  return (
    <div>
      <span data-testid="bg">{t.colors.background}</span>
      <span data-testid="msg">{translate('hello')}</span>
      <span data-testid="has-nav">{typeof navigate === 'function' ? 'yes' : 'no'}</span>
    </div>
  );
};

describe('FeedbackUiContext', () => {
  it('exposes theme, translate and navigate to consumers within the provider', () => {
    const navigate = jest.fn();
    render(
      <FeedbackUiProvider theme={theme} t={(key) => `t:${key}`} navigate={navigate}>
        <Consumer />
      </FeedbackUiProvider>
    );

    expect(screen.getByTestId('bg').textContent).toBe('#fff');
    expect(screen.getByTestId('msg').textContent).toBe('t:hello');
    expect(screen.getByTestId('has-nav').textContent).toBe('yes');
  });

  it('treats navigate as optional', () => {
    render(
      <FeedbackUiProvider theme={theme} t={(key) => key}>
        <Consumer />
      </FeedbackUiProvider>
    );

    expect(screen.getByTestId('has-nav').textContent).toBe('no');
  });

  it('falls back to a neutral default when used outside a provider', () => {
    render(<Consumer />);
    // identity translate + a non-empty default background, and no navigate
    expect(screen.getByTestId('msg').textContent).toBe('hello');
    expect(screen.getByTestId('bg').textContent).toBe('#ffffff');
    expect(screen.getByTestId('has-nav').textContent).toBe('no');
  });
});
