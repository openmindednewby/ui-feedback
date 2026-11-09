import { render, screen } from '@testing-library/react';

import { FeedbackUiProvider, type FeedbackTheme } from '../context/FeedbackUiContext';

import { ErrorState } from './ErrorState';

const ERROR_FILL = '#ae2012';
const ERROR_INK = '#ff8a7a';

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
  semantic: { error: { '500': ERROR_FILL } },
};

const inkTheme: FeedbackTheme = {
  ...baseTheme,
  semanticText: { success: '#7fe0a0', warning: '#ffd27a', error: ERROR_INK, info: '#8ac7ff' },
};

function renderWith(theme: FeedbackTheme, ui: React.ReactElement): void {
  render(
    <FeedbackUiProvider t={(key) => key} theme={theme}>
      {ui}
    </FeedbackUiProvider>,
  );
}

describe('ErrorState message colour', () => {
  it('with semanticText, renders the message in the semantic text error colour', () => {
    renderWith(inkTheme, <ErrorState message="Boom" />);

    const message = screen.getByText('Boom');

    expect(message).toHaveStyle({ color: ERROR_INK });
  });

  it('with no semanticText, renders the message in the error fill', () => {
    renderWith(baseTheme, <ErrorState message="Boom" />);

    const message = screen.getByText('Boom');

    expect(message).toHaveStyle({ color: ERROR_FILL });
  });

  it('with semanticText and a title, keeps the message on the secondary text colour', () => {
    renderWith(inkTheme, <ErrorState message="Boom" title="Heading" />);

    const message = screen.getByText('Boom');

    expect(message).toHaveStyle({ color: baseTheme.colors.textSecondary });
  });

  it('with semanticText and an icon, keeps the icon well on the error fill', () => {
    renderWith(inkTheme, <ErrorState icon={<span />} message="Boom" />);

    const well = screen.getByTestId('error-state-icon').firstElementChild;

    expect(well).toHaveStyle({ backgroundColor: ERROR_FILL });
  });
});
