import { render, screen } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';
import { SkeletonLines } from './SkeletonLines';

jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => true,
  prefersReducedMotion: (): boolean => true,
}));

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
const t: UiValue['t'] = (key) => key;

function renderWithUi(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('SkeletonLines', () => {
  it('with three lines, renders one shimmer block per line', () => {
    const lines = [{ height: 16, width: '40%' }, { height: 34 }, { height: 13, width: 120 }];

    renderWithUi(<SkeletonLines lines={lines} />);

    expect(screen.getAllByTestId('skeleton')).toHaveLength(lines.length);
  });

  it('with no testID, marks the stack busy under the default testID', () => {
    renderWithUi(<SkeletonLines lines={[{ height: 16 }]} />);

    expect(screen.getByTestId('skeleton-lines').getAttribute('aria-busy')).toBe('true');
  });

  it('with a testID, uses it for the stack', () => {
    renderWithUi(<SkeletonLines lines={[{ height: 16 }]} testID="tile-loading" />);

    expect(screen.getByTestId('tile-loading')).toBeTruthy();
  });
});
