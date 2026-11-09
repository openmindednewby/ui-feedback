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

const LOGO_TEST_ID = 'brand-logo';
const LOGO_SLOT_TEST_ID = 'error-boundary-logo';
const TITLE = 'Something broke';

const Thrower = (): React.ReactElement => {
  throw new Error('render failure');
};

function renderFailure(logo?: React.ReactNode, recover?: () => boolean): void {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  render(
    <UiProvider t={t} theme={theme}>
      <AppErrorBoundary
        fallback={logo === undefined ? undefined : ({ renderDefault }) => renderDefault(logo)}
        labels={{ title: TITLE }}
        recover={recover}
      >
        <Thrower />
      </AppErrorBoundary>
    </UiProvider>,
  );
}

describe('AppErrorBoundary logo', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('with a logo, shows it above the error title', () => {
    renderFailure(<span data-testid={LOGO_TEST_ID}>logo</span>);

    const position = screen.getByTestId(LOGO_TEST_ID).compareDocumentPosition(screen.getByText(TITLE));

    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('while recovering, renderDefault still shows the updating state', () => {
    renderFailure(<span data-testid={LOGO_TEST_ID}>logo</span>, () => true);

    const updating = screen.queryByTestId('error-boundary-updating');

    expect(updating).not.toBeNull();
  });

  it('without a logo, adds no logo slot', () => {
    renderFailure();

    const slot = screen.queryByTestId(LOGO_SLOT_TEST_ID);

    expect(slot).toBeNull();
  });
});
