import { render, screen } from '@testing-library/react';

import { FeedbackUiProvider, type FeedbackTheme } from '../context/FeedbackUiContext';

import { LiveRunCard } from './LiveRunCard';
import { RunGroupChips, RunGroupSummary } from './RunGroupChips';

import type { RunGroup } from './runGroups';
import type { LiveRunCardLabels } from './types';

const ERROR_FILL = '#ae2012';
const ERROR_INK = '#ff8a7a';
const SUCCESS_FILL = '#16a34a';
const SUCCESS_INK = '#7fe0a0';

const labels: LiveRunCardLabels = {
  status: 'Failed',
  meta: 'started 13:00',
  progress: '440 of 5,562',
  progressA11y: 'Run progress',
  cancel: 'Cancel run',
  cancelHint: 'Stops the run',
  stepTimings: 'Step timings',
  stepTimingsHint: 'Shows step times',
  groupHint: 'Shows this group',
  moreStepsHint: 'Shows every step',
  fewerSteps: 'Show fewer',
  formatDuration: (s) => `${String(s)}s`,
  moreSteps: (n) => `+${String(n)} shorter steps`,
  doneSummary: (n, d) => `${String(n)} done ${d}`,
  groupA11y: (l, st, d) => `${l} ${st} ${d}`,
  stepA11y: (l, d) => `${l} ${d}`,
};

const groups: RunGroup[] = [
  { id: 'UN', label: 'UN', state: 'done', durationSec: 4, steps: [{ label: 'fetching', durationSec: 4, state: 'done' }] },
];

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
  semantic: { error: { '500': ERROR_FILL }, warning: { '500': '#d97706' }, success: { '500': SUCCESS_FILL } },
};

const inkTheme: FeedbackTheme = {
  ...baseTheme,
  semanticText: { success: SUCCESS_INK, warning: '#ffd27a', error: ERROR_INK, info: '#8ac7ff' },
};

function renderWith(theme: FeedbackTheme, ui: React.ReactElement): void {
  render(
    <FeedbackUiProvider t={(key) => key} theme={theme}>
      {ui}
    </FeedbackUiProvider>,
  );
}

const failedCard = (
  <LiveRunCard compact={false} groups={groups} labels={labels} onCancel={jest.fn()} status="failed" title="Lists" />
);

describe('LiveRunCard text colours', () => {
  it('with semanticText, renders the status pill in the semantic text colour', () => {
    renderWith(inkTheme, failedCard);

    const status = screen.getByTestId('live-run-card-status');

    expect(status).toHaveStyle({ color: ERROR_INK });
  });

  it('with no semanticText, renders the status pill in the fill tone', () => {
    renderWith(baseTheme, failedCard);

    const status = screen.getByTestId('live-run-card-status');

    expect(status).toHaveStyle({ color: ERROR_FILL });
  });

  it('with semanticText, renders the Cancel label in the semantic text colour', () => {
    renderWith(inkTheme, failedCard);

    const cancel = screen.getByText(labels.cancel);

    expect(cancel).toHaveStyle({ color: ERROR_INK });
  });

  it('with no semanticText, renders the Cancel label in the error fill', () => {
    renderWith(baseTheme, failedCard);

    const cancel = screen.getByText(labels.cancel);

    expect(cancel).toHaveStyle({ color: ERROR_FILL });
  });
});

describe('RunGroupChips text colours', () => {
  it('with semanticText, renders the chip text in the semantic text colour', () => {
    renderWith(inkTheme, <RunGroupChips groups={groups} labels={labels} testID="chips" />);

    const text = screen.getByTestId('chips-UN').firstElementChild;

    expect(text).toHaveStyle({ color: SUCCESS_INK });
  });

  it('with no semanticText, renders the chip text in the fill tone', () => {
    renderWith(baseTheme, <RunGroupChips groups={groups} labels={labels} testID="chips" />);

    const text = screen.getByTestId('chips-UN').firstElementChild;

    expect(text).toHaveStyle({ color: SUCCESS_FILL });
  });
});

describe('RunGroupSummary text colours', () => {
  it('with semanticText, renders the done chip text in the semantic text colour', () => {
    renderWith(inkTheme, <RunGroupSummary groups={groups} labels={labels} testID="summary" />);

    const text = screen.getByTestId('summary-done').firstElementChild;

    expect(text).toHaveStyle({ color: SUCCESS_INK });
  });

  it('with no semanticText, renders the done chip text in the fill tone', () => {
    renderWith(baseTheme, <RunGroupSummary groups={groups} labels={labels} testID="summary" />);

    const text = screen.getByTestId('summary-done').firstElementChild;

    expect(text).toHaveStyle({ color: SUCCESS_FILL });
  });
});
