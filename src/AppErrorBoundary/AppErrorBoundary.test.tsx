/**
 * Unit tests for AppErrorBoundary.
 *
 * The load-bearing assertions: it CATCHES (rather than letting the tree die),
 * it reports through `onError`, `recover` diverts to the updating screen, retry
 * re-renders the children, and — the thing none of the six app-local copies did
 * — the fallback announces itself with `role="alert"`.
 */
import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { AppErrorBoundary } from './AppErrorBoundary';
import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';

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
  semantic: { error: { '500': '#ae2012' }, warning: { '500': '#d97706' } },
};
const t: UiValue['t'] = (key) => key;

const BOOM = 'kaboom in render';

const Thrower = (): React.ReactElement => {
  throw new Error(BOOM);
};

const Ok = (): React.ReactElement => <div data-testid="ok-child" />;

function renderWithUi(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <UiProvider t={t} theme={theme}>
      {ui}
    </UiProvider>,
  );
}

describe('AppErrorBoundary', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Silence the expected React error-boundary console noise.
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders its children when nothing throws', () => {
    renderWithUi(
      <AppErrorBoundary>
        <Ok />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('ok-child')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('catches a render error and shows the fallback instead of the children', () => {
    renderWithUi(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.queryByTestId('ok-child')).not.toBeInTheDocument();
  });

  it('announces the fallback assertively (role="alert") — the a11y regression fix', () => {
    renderWithUi(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toHaveAttribute('role', 'alert');
  });

  it('reports the caught error through onError (the Sentry/logger injection)', () => {
    const onError = jest.fn();

    renderWithUi(
      <AppErrorBoundary onError={onError}>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const [error, info] = onError.mock.calls[0] as [Error, React.ErrorInfo];
    expect(error.message).toBe(BOOM);
    expect(info).toHaveProperty('componentStack');
  });

  it('shows the updating screen (not the error screen) when recover returns true', () => {
    const recover = jest.fn().mockReturnValue(true);

    renderWithUi(
      <AppErrorBoundary recover={recover}>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(recover).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('error-boundary-updating')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary-retry-button')).not.toBeInTheDocument();
  });

  it('falls through to the error screen when recover returns false', () => {
    const recover = jest.fn().mockReturnValue(false);

    renderWithUi(
      <AppErrorBoundary recover={recover}>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(recover).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('error-boundary-updating')).not.toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-retry-button')).toBeInTheDocument();
  });

  it('still reports through onError when recover handles the error', () => {
    const onError = jest.fn();

    renderWithUi(
      <AppErrorBoundary recover={(): boolean => true} onError={onError}>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('retry resets the boundary and re-renders the children', () => {
    let shouldThrow = true;
    const Flaky = (): React.ReactElement => {
      if (shouldThrow) throw new Error(BOOM);
      return <Ok />;
    };

    renderWithUi(
      <AppErrorBoundary>
        <Flaky />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByTestId('error-boundary-retry-button'));

    expect(screen.getByTestId('ok-child')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('uses the caller-supplied fallback render-prop when given', () => {
    renderWithUi(
      <AppErrorBoundary
        fallback={({ error, retry }): React.ReactNode => (
          <button data-testid="custom-fallback" type="button" onClick={retry}>
            {error?.message}
          </button>
        )}
      >
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('custom-fallback')).toHaveTextContent(BOOM);
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('renders pre-localized labels from the caller and defaults the rest', () => {
    renderWithUi(
      <AppErrorBoundary labels={{ title: 'Κάτι πήγε στραβά' }}>
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Κάτι πήγε στραβά')).toBeInTheDocument();
    // Untouched key still falls back to the English default.
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('hides the error text by default and shows it when showDetails is set', () => {
    const { unmount } = renderWithUi(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>,
    );
    expect(screen.queryByTestId('error-boundary-details')).not.toBeInTheDocument();
    unmount();

    renderWithUi(
      <AppErrorBoundary showDetails>
        <Thrower />
      </AppErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-details')).toBeInTheDocument();
    expect(screen.getByText(BOOM)).toBeInTheDocument();
  });

  it('namespaces every testID with testIDPrefix', () => {
    renderWithUi(
      <AppErrorBoundary testIDPrefix="shell-boundary">
        <Thrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('shell-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('shell-boundary-retry-button')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('renders the optional reload action only when onReload is supplied', () => {
    const onReload = jest.fn();

    const { unmount } = renderWithUi(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>,
    );
    expect(screen.queryByTestId('error-boundary-reload-button')).not.toBeInTheDocument();
    unmount();

    renderWithUi(
      <AppErrorBoundary onReload={onReload}>
        <Thrower />
      </AppErrorBoundary>,
    );
    fireEvent.click(screen.getByTestId('error-boundary-reload-button'));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('renders the shared ErrorState so the message themes from UiProvider', () => {
    renderWithUi(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>,
    );

    // ErrorState is mounted with the boundary-scoped testID.
    expect(screen.getByTestId('error-boundary-message')).toBeInTheDocument();
  });
});
