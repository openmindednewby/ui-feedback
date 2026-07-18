/**
 * Unit tests for the PER-ERROR half of <AppErrorBoundary> (v1.7.0).
 *
 * These cover the four injections that let an app vary the boundary BY ERROR CLASS
 * without the kit ever learning what a class is — `retryable`, `labelsFor`,
 * functional `showDetails`, `onMount` — plus `reloadIsPrimary`.
 *
 * Deliberately a separate file from AppErrorBoundary.test.tsx: that suite encodes the
 * pre-1.7.0 contract and is left byte-for-byte untouched, so it doubles as the
 * back-compat proof for every default here.
 */
import React from 'react';

import { render, screen } from '@testing-library/react';

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

const CHUNK_MESSAGE = 'Loading chunk _layout-abc123 failed';
const PLAIN_MESSAGE = 'Cannot read properties of undefined (reading x)';

const RETRY_ID = 'error-boundary-retry-button';
const RELOAD_ID = 'error-boundary-reload-button';
const DETAILS_ID = 'error-boundary-details';

/** Stands in for the apps' `isChunkLoadError` — the kit never sees this predicate's logic. */
const isChunk = (error: Error): boolean => error.message.includes('Loading chunk');

const ChunkThrower = (): React.ReactElement => {
  throw Object.assign(new Error(CHUNK_MESSAGE), { name: 'ChunkLoadError' });
};

const PlainThrower = (): React.ReactElement => {
  throw new Error(PLAIN_MESSAGE);
};

const Ok = (): React.ReactElement => <div data-testid="ok-child" />;

function renderWithUi(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <UiProvider t={t} theme={theme}>
      {ui}
    </UiProvider>,
  );
}

describe('AppErrorBoundary — retryable', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('hides the retry action when retryable returns false', () => {
    renderWithUi(
      <AppErrorBoundary retryable={(error): boolean => !isChunk(error)} onReload={jest.fn()}>
        <ChunkThrower />
      </AppErrorBoundary>,
    );

    // Retrying a missing chunk re-renders straight back into the same 404.
    expect(screen.queryByTestId(RETRY_ID)).not.toBeInTheDocument();
    // Reload — the action that actually works — is still offered.
    expect(screen.getByTestId(RELOAD_ID)).toBeInTheDocument();
  });

  it('keeps the retry action for an error the same predicate calls retryable', () => {
    renderWithUi(
      <AppErrorBoundary retryable={(error): boolean => !isChunk(error)} onReload={jest.fn()}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId(RETRY_ID)).toBeInTheDocument();
    expect(screen.getByTestId(RELOAD_ID)).toBeInTheDocument();
  });

  it('treats every error as retryable when no predicate is supplied (default)', () => {
    renderWithUi(
      <AppErrorBoundary>
        <ChunkThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId(RETRY_ID)).toBeInTheDocument();
  });
});

describe('AppErrorBoundary — labelsFor', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('merges per-error wording OVER the static labels', () => {
    renderWithUi(
      <AppErrorBoundary
        labels={{ title: 'Something went wrong', message: 'Static message' }}
        labelsFor={(error): { title: string; message: string } | Record<string, never> =>
          isChunk(error) ? { title: 'Update available', message: 'Reload to get the latest.' } : {}
        }
      >
        <ChunkThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Update available')).toBeInTheDocument();
    expect(screen.getByText('Reload to get the latest.')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('leaves the static labels intact for an error it does not override', () => {
    renderWithUi(
      <AppErrorBoundary
        labels={{ title: 'Something went wrong' }}
        labelsFor={(error): { title: string } | Record<string, never> =>
          isChunk(error) ? { title: 'Update available' } : {}
        }
      >
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('still defaults keys neither labels nor labelsFor supplies', () => {
    renderWithUi(
      <AppErrorBoundary labelsFor={(): { title: string } => ({ title: 'Update available' })}>
        <ChunkThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Update available')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});

describe('AppErrorBoundary — showDetails', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('accepts a predicate and suppresses the block for the errors it rejects', () => {
    renderWithUi(
      <AppErrorBoundary showDetails={(error): boolean => !isChunk(error)}>
        <ChunkThrower />
      </AppErrorBoundary>,
    );

    // A hashed filename is noise, not signal — the user can do nothing with it.
    expect(screen.queryByTestId(DETAILS_ID)).not.toBeInTheDocument();
  });

  it('shows the block for an error the same predicate accepts', () => {
    renderWithUi(
      <AppErrorBoundary showDetails={(error): boolean => !isChunk(error)}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId(DETAILS_ID)).toBeInTheDocument();
    expect(screen.getByText(PLAIN_MESSAGE)).toBeInTheDocument();
  });

  it('a plain boolean still behaves exactly as before (back-compat)', () => {
    const { unmount } = renderWithUi(
      <AppErrorBoundary showDetails={false}>
        <PlainThrower />
      </AppErrorBoundary>,
    );
    expect(screen.queryByTestId(DETAILS_ID)).not.toBeInTheDocument();
    unmount();

    renderWithUi(
      <AppErrorBoundary showDetails>
        <PlainThrower />
      </AppErrorBoundary>,
    );
    expect(screen.getByTestId(DETAILS_ID)).toBeInTheDocument();
    expect(screen.getByText(PLAIN_MESSAGE)).toBeInTheDocument();
  });
});

describe('AppErrorBoundary — onMount', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('fires on a clean mount — the apps release their one-shot reload guard here', () => {
    const onMount = jest.fn();

    renderWithUi(
      <AppErrorBoundary onMount={onMount}>
        <Ok />
      </AppErrorBoundary>,
    );

    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire when the mount itself errored', () => {
    const onMount = jest.fn();

    renderWithUi(
      <AppErrorBoundary onMount={onMount}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    // React still runs componentDidMount after the fallback renders. Releasing the
    // guard there would re-arm it during the very failure it is meant to bound.
    expect(onMount).not.toHaveBeenCalled();
  });

  it('does NOT fire when the mount errored into the recovering state either', () => {
    const onMount = jest.fn();

    renderWithUi(
      <AppErrorBoundary recover={(): boolean => true} onMount={onMount}>
        <ChunkThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('error-boundary-updating')).toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
  });
});

describe('AppErrorBoundary — reloadIsPrimary', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  /** DOM order of the two action buttons, top to bottom. */
  function actionOrder(): string[] {
    const buttons = [screen.queryByTestId(RETRY_ID), screen.queryByTestId(RELOAD_ID)].filter(
      (node): node is HTMLElement => node !== null,
    );
    return buttons
      .sort((a, b) =>
        // eslint-disable-next-line no-bitwise
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      .map((node) => node.getAttribute('data-testid') ?? '');
  }

  it('defaults to Try Again first — agora-web / zygos-web must not shift', () => {
    renderWithUi(
      <AppErrorBoundary onReload={jest.fn()}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(actionOrder()).toEqual([RETRY_ID, RELOAD_ID]);
  });

  it('puts Reload first when reloadIsPrimary is set — the three chunk-aware apps', () => {
    renderWithUi(
      <AppErrorBoundary reloadIsPrimary onReload={jest.fn()}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(actionOrder()).toEqual([RELOAD_ID, RETRY_ID]);
  });

  it('gives the filled emphasis to Reload when reloadIsPrimary is set', () => {
    renderWithUi(
      <AppErrorBoundary reloadIsPrimary onReload={jest.fn()}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId(RELOAD_ID)).toHaveStyle({ backgroundColor: theme.palette.primary['500'] });
    expect(screen.getByTestId(RETRY_ID)).toHaveStyle({ backgroundColor: theme.colors.surface });
  });

  it('gives the filled emphasis to Try Again by default', () => {
    renderWithUi(
      <AppErrorBoundary onReload={jest.fn()}>
        <PlainThrower />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId(RETRY_ID)).toHaveStyle({ backgroundColor: theme.palette.primary['500'] });
    expect(screen.getByTestId(RELOAD_ID)).toHaveStyle({ backgroundColor: theme.colors.surface });
  });
});

describe('AppErrorBoundary — no provider above it', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders the fallback without throwing when mounted ABOVE UiProvider', () => {
    // The fleet mounts the boundary above UiProvider on purpose: caught-and-plain
    // beats themed-and-uncaught. useFeedbackUi() must therefore degrade, not throw.
    expect(() =>
      render(
        <AppErrorBoundary onReload={jest.fn()}>
          <PlainThrower />
        </AppErrorBoundary>,
      ),
    ).not.toThrow();

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId(RETRY_ID)).toBeInTheDocument();
  });
});
