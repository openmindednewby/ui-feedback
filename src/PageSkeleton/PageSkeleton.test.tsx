import { render, screen } from '@testing-library/react';

import {
  FeedbackUiProvider as UiProvider,
  type FeedbackTheme as UiTheme,
  type FeedbackUiValue as UiValue,
} from '../context/FeedbackUiContext';
import { PageSkeleton } from './PageSkeleton';

/**
 * Reduced-motion is owned by the ui-motion <Skeleton> (via @dloizides/rn-web-hooks).
 * PageSkeleton itself no longer runs an animation loop — it only lays out blocks — so
 * this suite asserts the LAYOUT (block count per props) and that the reduced-motion
 * path still renders the same blocks statically.
 */
let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
  prefersReducedMotion: (): boolean => mockReduced,
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

const SKELETON_BLOCK_TEST_ID = 'skeleton';
const BLOCKS_PER_LIST_ROW = 3; // avatar + two text lines

describe('PageSkeleton', () => {
  beforeEach(() => {
    mockReduced = false;
  });

  it('renders the page-skeleton container', () => {
    renderWithUi(<PageSkeleton />);
    expect(screen.getByTestId('page-skeleton')).toBeTruthy();
  });

  it('renders a header block plus three blocks per list row by default', () => {
    const rows = 5;
    renderWithUi(<PageSkeleton rows={rows} />);
    const expected = 1 + rows * BLOCKS_PER_LIST_ROW;
    expect(screen.getAllByTestId(SKELETON_BLOCK_TEST_ID)).toHaveLength(expected);
  });

  it('omits the header block when showHeader is false', () => {
    const rows = 3;
    renderWithUi(<PageSkeleton rows={rows} showHeader={false} />);
    const expected = rows * BLOCKS_PER_LIST_ROW;
    expect(screen.getAllByTestId(SKELETON_BLOCK_TEST_ID)).toHaveLength(expected);
  });

  it('renders one block per row (plus header) in the cards variant', () => {
    const rows = 4;
    renderWithUi(<PageSkeleton rows={rows} variant="cards" />);
    const expected = 1 + rows;
    expect(screen.getAllByTestId(SKELETON_BLOCK_TEST_ID)).toHaveLength(expected);
  });

  it('renders the same block layout under reduced-motion (static, no shimmer loop)', () => {
    mockReduced = true;
    const rows = 2;
    renderWithUi(<PageSkeleton rows={rows} />);
    expect(screen.getByTestId('page-skeleton')).toBeTruthy();
    const expected = 1 + rows * BLOCKS_PER_LIST_ROW;
    expect(screen.getAllByTestId(SKELETON_BLOCK_TEST_ID)).toHaveLength(expected);
  });
});
