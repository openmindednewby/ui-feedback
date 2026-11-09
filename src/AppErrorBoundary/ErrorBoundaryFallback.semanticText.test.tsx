import { render, screen } from '@testing-library/react';

import { FeedbackUiProvider, type FeedbackTheme } from '../context/FeedbackUiContext';

import { ErrorBoundaryFallback } from './ErrorBoundaryFallback';
import { DEFAULT_ERROR_BOUNDARY_LABELS } from './labels';

const WARNING_FILL = '#d97706';
const WARNING_INK = '#ffd27a';
const PREFIX = 'boundary';

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
  semantic: { error: { '500': '#ae2012' }, warning: { '500': WARNING_FILL } },
};

const inkTheme: FeedbackTheme = {
  ...baseTheme,
  semanticText: { success: '#7fe0a0', warning: WARNING_INK, error: '#ff8a7a', info: '#8ac7ff' },
};

function renderFallback(theme: FeedbackTheme): void {
  render(
    <FeedbackUiProvider t={(key) => key} theme={theme}>
      <ErrorBoundaryFallback
        error={new Error('details')}
        labels={DEFAULT_ERROR_BOUNDARY_LABELS}
        onRetry={jest.fn()}
        reloadIsPrimary={false}
        showDetails
        showRetry
        testIDPrefix={PREFIX}
      />
    </FeedbackUiProvider>,
  );
}

describe('ErrorBoundaryFallback details colours', () => {
  it('with semanticText, renders the details title in the semantic text warning colour', () => {
    renderFallback(inkTheme);

    const heading = screen.getByText(DEFAULT_ERROR_BOUNDARY_LABELS.errorDetails);

    expect(heading).toHaveStyle({ color: WARNING_INK });
  });

  it('with no semanticText, renders the details title in the warning fill', () => {
    renderFallback(baseTheme);

    const heading = screen.getByText(DEFAULT_ERROR_BOUNDARY_LABELS.errorDetails);

    expect(heading).toHaveStyle({ color: WARNING_FILL });
  });
});
