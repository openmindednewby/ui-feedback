import { fireEvent, render, screen } from '@testing-library/react';

import { LiveRunCard } from './LiveRunCard';

import type { RunGroup } from './runGroups';
import type { LiveRunCardLabels } from './types';

const labels: LiveRunCardLabels = {
  status: 'Running',
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
  {
    id: 'W',
    label: 'Wikidata',
    state: 'running',
    durationSec: 60,
    steps: [
      { label: 'offices', durationSec: 30, state: 'done' },
      { label: 'leaders', durationSec: 20, state: 'done' },
      { label: 'tiny', durationSec: 1, state: 'done' },
      { label: 'holders', durationSec: 9, state: 'running' },
    ],
  },
];

describe('LiveRunCard', () => {
  it('with Cancel pressed, calls onCancel once', () => {
    const onCancel = jest.fn();
    render(<LiveRunCard title="Lists" groups={groups} labels={labels} onCancel={onCancel} compact={false} />);

    fireEvent.click(screen.getByTestId('live-run-card-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('when compact, keeps step times hidden until the toggle is pressed', () => {
    render(<LiveRunCard title="Lists" groups={groups} labels={labels} compact />);
    const before = screen.queryByTestId('live-run-card-steps');

    fireEvent.click(screen.getByTestId('live-run-card-timings-toggle'));

    expect([before, screen.queryByTestId('live-run-card-steps')].map((n) => n !== null)).toEqual([false, true]);
  });

  it('with more steps than maxBars, folds the shortest and reveals them on the more toggle', () => {
    render(<LiveRunCard title="Lists" groups={groups} labels={labels} compact={false} maxBars={2} />);

    fireEvent.click(screen.getByTestId('live-run-card-steps-more'));

    expect(screen.getByTestId('live-run-card-steps-row-3')).toBeTruthy();
  });

  it('with a finished group chip pressed, shows that group steps', () => {
    render(<LiveRunCard title="Lists" groups={groups} labels={labels} compact={false} />);

    fireEvent.click(screen.getByTestId('live-run-card-groups-UN'));

    expect(screen.getByLabelText('fetching 4s')).toBeTruthy();
  });
});
