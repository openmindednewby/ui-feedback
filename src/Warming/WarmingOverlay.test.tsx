import { render, screen, act } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
} from '../context/FeedbackUiContext';
import { WarmingOverlay } from './WarmingOverlay';
import { notifyWarming, settleWarming } from './warmingStore';

const theme: UiTheme = {
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

function renderWithUi(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={(key) => key}>{ui}</UiProvider>);
}

describe('WarmingOverlay', () => {
  afterEach(() => {
    act(() => settleWarming());
  });

  it('renders nothing while the store is idle', () => {
    renderWithUi(<WarmingOverlay />);
    expect(screen.queryByTestId('warming-overlay')).toBeNull();
  });

  it('renders the branded content once warming is notified', () => {
    renderWithUi(<WarmingOverlay />);
    act(() => notifyWarming({ attempt: 1, status: 503 }));

    expect(screen.getByTestId('warming-overlay')).toBeTruthy();
    expect(screen.getByText('Warming up…')).toBeTruthy();
    expect(screen.getByText('This only takes a moment')).toBeTruthy();
  });

  it('disappears when the store settles', () => {
    renderWithUi(<WarmingOverlay />);
    act(() => notifyWarming({ attempt: 1 }));
    expect(screen.getByTestId('warming-overlay')).toBeTruthy();

    act(() => settleWarming());
    expect(screen.queryByTestId('warming-overlay')).toBeNull();
  });

  it('applies custom labels over the English defaults', () => {
    renderWithUi(<WarmingOverlay labels={{ title: 'Ξεκινάμε…' }} />);
    act(() => notifyWarming({ attempt: 1 }));

    expect(screen.getByText('Ξεκινάμε…')).toBeTruthy();
    // Unset fields still fall back to the default copy.
    expect(screen.getByText('This only takes a moment')).toBeTruthy();
  });

  it('shows the attempt hint only when enabled', () => {
    renderWithUi(<WarmingOverlay showAttempt />);
    act(() => notifyWarming({ attempt: 2 }));
    expect(screen.getByTestId('warming-overlay-attempt')).toBeTruthy();
    expect(screen.getByText('Attempt 2')).toBeTruthy();
  });

  it('honours a custom testIdPrefix', () => {
    renderWithUi(<WarmingOverlay testIdPrefix="cold-start" />);
    act(() => notifyWarming({ attempt: 1 }));
    expect(screen.getByTestId('cold-start')).toBeTruthy();
    expect(screen.getByTestId('cold-start-title')).toBeTruthy();
  });
});
