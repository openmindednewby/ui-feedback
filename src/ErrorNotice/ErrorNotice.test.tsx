import { Text } from 'react-native';

import { render, screen } from '@testing-library/react';

import { FeedbackUiProvider, type FeedbackTheme } from '../context/FeedbackUiContext';

import { ErrorNotice } from './ErrorNotice';

const theme: FeedbackTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#111111',
    textSecondary: '#666666',
    border: '#dddddd',
  },
  palette: { primary: { '500': '#005f73' } },
  semantic: { error: { '50': '#fdecea', '500': '#ae2012' } },
};

function renderNotice(): HTMLElement {
  render(
    <FeedbackUiProvider t={(key) => key} theme={theme}>
      <ErrorNotice testID="notice">
        <Text>Amount is required</Text>
      </ErrorNotice>
    </FeedbackUiProvider>
  );
  return screen.getByTestId('notice');
}

describe('ErrorNotice', () => {
  it('with lines, announces them politely', () => {
    const notice = renderNotice();

    expect(notice.getAttribute('aria-live')).toBe('polite');
  });

  it('with an error scale, borders in the 500 step and fills with the 50 step', () => {
    const notice = renderNotice();

    expect(notice).toHaveStyle({ borderTopColor: 'rgba(174,32,18,1.00)', backgroundColor: 'rgba(253,236,234,1.00)' });
  });

  it('with a line, shows it inside the box', () => {
    const notice = renderNotice();

    expect(notice.textContent).toBe('Amount is required');
  });
});
