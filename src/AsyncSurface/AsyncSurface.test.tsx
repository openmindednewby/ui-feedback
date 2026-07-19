/**
 * The branch ORDER inside AsyncSurface is the whole point of these tests.
 *
 * This component existed as two app-local copies with opposite ordering, and the
 * difference was a live user-visible bug that only a human noticing a button vanish ever
 * caught. Every "renders X in state Y" test below passes against BOTH orderings — only
 * `bothLoadingAndFailed` distinguishes them. That case is the regression gate; the rest
 * are here so a failure localises.
 */
import { render, screen, fireEvent } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';
import { FEEDBACK_TEST_IDS } from '../constants';

import { AsyncSurface } from './AsyncSurface';

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
  semantic: { error: { '500': '#ae2012' }, success: { '500': '#16a34a' } },
};

/** Echoes the key back, so an assertion names the translation key rather than English. */
const t: UiValue['t'] = (key) => key;

function renderSurface(props: Partial<React.ComponentProps<typeof AsyncSurface>> = {}): {
  onRetry: jest.Mock;
} {
  const onRetry = jest.fn();
  render(
    <UiProvider t={t} theme={theme}>
      <AsyncSurface isError={false} loading={false} onRetry={onRetry} {...props}>
        <span data-testid="surface-content">loaded</span>
      </AsyncSurface>
    </UiProvider>,
  );
  return { onRetry };
}

describe('AsyncSurface branch ordering', () => {
  it('THE REGRESSION GATE: when BOTH loading and isError are true, keeps showing the error', () => {
    // This is the state React Query is in during a retry: the previous failure is still
    // `isError`, and the refetch has raised `isLoading`. Checking `loading` first would
    // swap the error card for a skeleton here, unmounting the retry button from under the
    // operator's cursor mid-click — and leaving a user whose retry failed unable to reach
    // a second one. Error must win.
    renderSurface({ loading: true, isError: true });

    expect(screen.getByTestId(FEEDBACK_TEST_IDS.errorState)).toBeTruthy();
    expect(screen.queryByTestId(FEEDBACK_TEST_IDS.pageSkeleton)).toBeNull();
  });

  it('THE REGRESSION GATE: the retry button survives a retry that is still in flight', () => {
    // The user-facing consequence of the case above, asserted as behaviour rather than as
    // rendered markup: the control must remain present AND still fire.
    const { onRetry } = renderSurface({ loading: true, isError: true });

    const retry = screen.getByTestId(FEEDBACK_TEST_IDS.errorStateRetry);
    fireEvent.click(retry);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the children when neither loading nor failed', () => {
    renderSurface();

    expect(screen.getByTestId('surface-content')).toBeTruthy();
    expect(screen.queryByTestId(FEEDBACK_TEST_IDS.errorState)).toBeNull();
    expect(screen.queryByTestId(FEEDBACK_TEST_IDS.pageSkeleton)).toBeNull();
  });

  it('renders the skeleton, not the children, while loading', () => {
    renderSurface({ loading: true });

    expect(screen.getByTestId(FEEDBACK_TEST_IDS.pageSkeleton)).toBeTruthy();
    expect(screen.queryByTestId('surface-content')).toBeNull();
  });

  it('renders the error state, not the children, when failed', () => {
    renderSurface({ isError: true });

    expect(screen.getByTestId(FEEDBACK_TEST_IDS.errorState)).toBeTruthy();
    expect(screen.queryByTestId('surface-content')).toBeNull();
  });
});

describe('AsyncSurface failure message', () => {
  it('defaults to the shared common.loadFailed key rather than any server text', () => {
    renderSurface({ isError: true });

    expect(screen.getByText('common.loadFailed')).toBeTruthy();
  });

  it('uses an explicit message when one is supplied', () => {
    renderSurface({ isError: true, message: 'Shop unavailable' });

    expect(screen.getByText('Shop unavailable')).toBeTruthy();
    expect(screen.queryByText('common.loadFailed')).toBeNull();
  });
});
